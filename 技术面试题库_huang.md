# 技术面试题库 — 候选人 C

**考察范围:** 测试用例设计 · 测试分层 · 代码能力 · 数据库 · CI/CD · 排障
**不考察:** 性能、英文、软技能(另行安排)
**时长:** 80 分钟
**原则:** 每题都有可判定的答案;**全程不给方法论提示**(不说"等价类""边界值""分层"这类词)

---

## 面试前

- [ ] **提前一天只确认设备:** "明天需要看代码和 SQL,请用电脑参加。" **材料不提前发** —— 本套题有埋点,提前发会让他去搜
- [ ] 开场确认:"能看到我共享的屏幕吗?"
- [ ] 准备一个共享编辑器(或让他直接在 chat 里写)

---

## 时间分配

| 环节 | 时长 | 累计 |
|---|---|---|
| 0. 开场 | 3 min | 3 |
| **1. 测试用例设计(Create Trade API)** | 15 min | 18 |
| **2. 测试分层** | 10 min | 28 |
| **3. 代码能力** | 20 min | 48 |
| ——— 决策点 ——— | | |
| 4. 数据库 | 10 min | 58 |
| 5. CI/CD | 8 min | 66 |
| 6. 排障 | 10 min | 76 |
| 7. 反问 | 4 min | 80 |

**决策点:** 前三节若平均低于 3 分,后三节压缩为每节 5 分钟,50 分钟结束。

---

## 0. 开场(3 分钟)

> "今天主要聊技术,节奏会比较快。**前半段会围绕我们一个真实的建单接口,从设计用例一直聊到写代码**,后面会看一些 SQL 和配置。答不出来就直接说,我们往下走,不影响。后面留几分钟给你问我。"

---

## 1. 测试用例设计 —— Create Trade API(15 分钟)

> **本题库的主线材料。** 这个接口会贯穿第 1、2、3 节:第 1 节设计用例,第 2 节给用例分层,第 3 节把关键用例写成代码。**他在第 1 节发现的问题,第 3 节能不能落地,是本场最有价值的观察。**
>
> **可横向比较:** Bo Ling 看过完整材料,漏掉了 `transactionId`;尹宏伟因手机只看到前几个字段。

### 1.0 材料(共享屏幕,不提前发)

**Request**

```
POST /api/v1/trades/create?tradeAction=SAVE
Content-Type: multipart/form-data
X-User-Id: maker@bank.com
```

**Part 1** —— `name="trade"`,`Content-Type: application/json`

```json
{
  "transactionId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "basic": {
    "portfolioId": "ABS_EQF",
    "counterpartyFmId": "300000001",
    "counterpartyName": "10 AM NY",
    "productId": "FX_TRF",
    "direction": "Buy",
    "notionalCurrency": "",
    "premiumAmount": 0,
    "premiumCurrency": "USD",
    "premiumDate": "2026-09-16",
    "iaCcy": "USD",
    "structuringInvolved": false,
    "udf": [
      { "key": "stepInType",   "value": "StepInFull", "type": "Text" },
      { "key": "oldCptyName",  "value": "10 AM NY",   "type": "Text" },
      { "key": "oldCptyFmId",  "value": "300000001",  "type": "Text" },
      { "key": "novationDate", "value": "2026-09-14", "type": "Date" }
    ],
    "esgLinked": false,
    "excludeFromCsa": false,
    "breakClause": false
  }
}
```

**Part 2** —— `name="datFile"`,`filename="FX_TRF.dat"`,`application/octet-stream`

**Response —— HTTP 200,耗时约 60 秒**

```json
{
  "code": 200, "status": "SUCCESS", "msg": "",
  "data": { "trade": {
    "id": "TRD-1789347329384020000",
    "instrument": { "TRF": {
      "delivery": { "DD_Physical": { "dd_roundings": null } },
      "payoffDict": { "1": { "PD_BrokenLine": { "pdbrokenLine": [
        { "Segment": { "low": "-Infinity", "high": 146.2, "slope": -1,
                       "xAnchor": 146.2, "yAnchor": 0,
                       "inclLow": false, "inclHigh": false } },
        { "Segment": { "low": 146.2, "high": "Infinity", "slope": -1,
                       "xAnchor": 146.2, "yAnchor": 0,
                       "inclLow": true, "inclHigh": false } }
      ]}}}
    }}
  }}
}
```

**业务失败时:仍返回 HTTP 200** ⚠️
```json
{ "code": 400, "status": "FAILURE", "msg": "..." }
```

**必填字段:** `transactionId`、`portfolioId`、`counterpartyFmId`、`productId`、`direction`、`premiumCurrency`、`datFile`
*(面试官按实际系统修改)*

---

### 1.0.1 业务背景(1 分钟,念给他听)

> **他没有金融背景,这段背景是为了让题目考"测试思维",而不是考"是否懂外汇"。** 讲清楚之后,后面发现不了的问题就不能归因于领域知识。

> "简单介绍一下背景:
> - 这是在交易后台**录入一笔外汇结构化产品**,产品代码 FX_TRF。maker 录入并保存,之后由 checker 审批。
> - **`X-User-Id` 标识当前是谁在操作。**
> - `udf` 里那几个字段表示:**这笔交易是从原来的对手方(oldCpty)转让给现在的对手方(counterparty)的**,转让日期是 novationDate。
> - `datFile` 是这个产品的条款参数文件。
> - 响应里的 `payoffDict` 是收益结构:**按汇率分成几段,每段是一个线性函数**,`low` 和 `high` 是区间边界,`inclLow` / `inclHigh` 表示端点是否包含在区间内。"

---

### 1.1 开放起手(3 分钟)

> "**针对这个接口,你会从哪几个方面设计测试用例?** 先说方向,不用展开。有不清楚的可以问我。"

**只听、只记,不提示、不追问。** 记录他**提到的顺序** —— 第一反应反映思维习惯。

**打分清单(提到即勾):**
- [ ] **先提问再回答**(问业务规则、问字段含义、问必填以外的约束)⭐
- [ ] 必填 / 类型 / 长度 / 枚举校验
- [ ] 幂等性(transactionId)⭐
- [ ] 权限 / 身份(X-User-Id、maker-checker)⭐
- [ ] 跨字段业务规则(日期关系、对手方关系)
- [ ] multipart 两部分的一致性、文件异常
- [ ] 响应结构与业务状态的断言(HTTP 200 + body status)
- [ ] 并发 / 超时
- [ ] 下游影响(建单后能否查询、状态、审批流)

**⚠️ 关键观察:** 开放起手时**一个方向都没提到身份和幂等的**,说明他的测试思维停留在字段校验。

---

### 1.2 定向追问(10 分钟)⭐ 本节核心

> **他在 1.1 已经说到的,可以跳过或只问深一层;没说到的,逐一问。** 每题 1 分钟左右,都有可判定的答案。
> **优先级:** ⭐ 必问;其余视时间。

---

**Q1. transactionId ⭐**
> "`transactionId` 这个字段,你会怎么测?"

**期望:**
- [ ] 同一个 transactionId 提交两次 → **只生成一笔交易**,第二次返回原交易或明确拒绝
- [ ] **同一个 transactionId、不同 payload** → 应拒绝,而不是悄悄覆盖或新建
- [ ] **两个相同 transactionId 的请求并发到达** → 仍然只生成一笔
- [ ] 缺失、空串、非 UUID 格式

**判定:** 能主动说出"幂等"并给出前两条 = 通过。**只说"格式校验"的 = 不通过。**

---

**Q2. notionalCurrency ⭐**
> "`notionalCurrency` 是空字符串,但系统返回了 SUCCESS。**你怎么看?**"

**期望:**
- [ ] 外汇产品的名义本金币种为空,**大概率是缺陷**,至少需要跟 BA 确认
- [ ] **空字符串、null、字段缺失是三种不同情况**,要分别测 ⭐
- [ ] 追问一句"它是不是可以由其他字段推导出来",说明在思考业务而不只是字段

**判定:** 提出三种情况的区分 = 高分。说"不是必填字段所以没问题" = 低分。

---

**Q3. 对手方 ⭐**
> "看一下 `counterpartyFmId` / `counterpartyName` 和 `udf` 里的 `oldCptyFmId` / `oldCptyName`。**你发现什么了吗?**"

**答案:** 前后完全相同 —— **把交易转让给了自己**,业务上没有意义,系统却接受了。

**期望:**
- [ ] 发现两者相同
- [ ] 指出这是一条**跨字段校验**缺失
- [ ] 延伸:如果是转让交易(stepInType 存在),oldCpty 是不是必填?反过来,不是转让交易时,oldCpty 能不能有值?

**判定:** 背景已经讲过"从原对手方转让给新对手方",**这题考的是逻辑,不是领域知识。** 背景讲过仍没发现 = 观察力不足。

---

**Q4. 日期**
> "这里有 `premiumDate`(09-16)和 `novationDate`(09-14)。**你会问什么、测什么?**"

**期望:**
- [ ] 两个日期之间有没有先后约束?倒置了会怎样?
- [ ] 与**系统业务日期**的关系 —— 能不能是过去?能不能是很远的未来?
- [ ] 节假日、周末
- [ ] `udf` 里 `type: "Date"` 但 `value` 是非法日期字符串,会怎样?

---

**Q5. X-User-Id ⭐**
> "`X-User-Id` 这个 header,你会怎么测?"

**期望:**
- [ ] **把它改成别人的邮箱,能不能以别人的名义建单?** ⭐⭐
- [ ] 缺失、空值、不存在的用户、没有建单权限的用户(比如 checker)
- [ ] 延伸:**身份应该来自认证 token,而不是客户端自己传的 header** —— 如果服务端直接信任这个 header,就是一个安全漏洞

**判定:** 想到"伪造身份"= 通过。**能说出"身份不该由客户端 header 决定"的,是明确的高分信号。**

---

**Q6. multipart 一致性**
> "请求分两部分,JSON 和 `.dat` 文件。**这两部分之间,你会测什么?**"

**期望:**
- [ ] JSON 里是 FX_TRF,`.dat` 是另一个产品的参数 → 以谁为准?
- [ ] `.dat` 缺失、为空、损坏、超大、错误格式
- [ ] JSON 部分 Content-Type 错误

---

**Q7. 双重状态码 ⭐**
> "这个接口业务失败也返回 HTTP 200。**你的断言怎么写?**"

**期望:**
- [ ] **必须断言响应体里的 `status` / `code`,不能只看 HTTP 状态码**
- [ ] 延伸:**应该封装成框架里的公共断言方法**,否则每个人写用例都可能漏掉 ⭐
- [ ] 延伸:这对**所有现存用例**意味着什么 —— 只断言 200 的用例全部是假阳性

**判定:** 能主动提出"封装成公共方法"的,说明他从框架视角思考。**这一条会在第 3 节编码时检验他是否真的做到。**

---

**Q8. payoff 边界 ⭐**
> "如果要验证 `payoffDict` 这个收益结构是对的,**哪个汇率点你一定会测?为什么?**"

**答案:** **146.2** —— 两段的分界点。

**期望:**
- [ ] 答出 146.2
- [ ] 解释:第一段 `inclHigh: false`,第二段 `inclLow: true`,**所以 146.2 归第二段,不重叠也不留空** ⭐
- [ ] 延伸:如果两段的 incl 都是 false,146.2 就不属于任何一段(空洞);都是 true 就重复计算
- [ ] 发现 `"-Infinity"` / `"Infinity"` 是**字符串**,而同一对象里 `146.2` 是**数字** —— 类型不一致,反序列化和下游消费都可能出问题

**判定:** 答出 146.2 并解释 incl 归属 = 通过。**发现 Infinity 字符串与数字类型不一致的,是细节敏感度的强信号。**

---

**Q9. 60 秒响应 ⭐⭐**
> "这个接口大约要 60 秒才返回。**这对你的测试有什么影响?**"

**期望:**
- [ ] 客户端超时怎么设?网关超时是多少?
- [ ] ⭐⭐ **客户端超时了,但服务端还在处理 —— 交易最后到底建没建成?** 会产生"前端报错、后台已建单"的幽灵交易
- [ ] ⭐⭐ **这时候如果客户端重试,会不会建出两笔?** → **这取决于 Q1 的幂等性有没有做好**

**这是整组题里最有价值的一问。** 能把 Q9(超时)和 Q1(幂等)**自己串起来**的人,理解的是系统,而不是一个个孤立的字段。

**判定:** 提到幽灵交易 = 4 分。**自己把超时重试和幂等性联系起来 = 5 分。**

---

**Q10. 必填字段**
> "7 个必填字段,**每个字段你写几条用例?** 总共多少条?怎么组织?"

**期望:**
- [ ] 每个字段至少:缺失、null、空串、错误类型 → 约 4 条 × 7 = 28 条
- [ ] **用参数化组织,不写 28 个函数** —— 这条会在第 3 节编码时检验
- [ ] 不需要做全组合(两两缺失、三三缺失),单字段缺失覆盖即可,说明有成本意识

---

### 1.3 优先级(2 分钟)

> "你只有半天时间,**只能写 10 条用例。选哪 10 条?** 你放弃了什么风险?"

**期望:**
- [ ] 按**业务后果**排序,而不是按字段顺序
- [ ] 前几条应该是:正常建单主流程、幂等(重复提交)、身份伪造、业务失败断言、超时后状态
- [ ] **敢明说放弃了什么** —— 比如放弃了大部分字段格式校验、放弃了 `.dat` 的各种异常

| 分数 | 表现 |
|---|---|
| 5 | 前 5 条里有幂等和身份;能说出放弃了什么及其风险 |
| 3 | 按字段顺序挑,主流程 + 必填校验为主 |
| 1 | 说"都很重要,都要测" |

---

### 1 节评分

| 分数 | 表现 |
|---|---|
| **5** | 1.1 **先提问**,提到幂等和身份;1.2 的 ⭐ 题答对 5 题以上;**Q9 自己串联起幂等**;Q3 独立发现对手方相同 |
| **4** | ⭐ 题答对 4 题,Q3 或 Q8 至少一个独立发现 |
| **3** | 字段校验全面,但幂等和身份需要追问才想到 |
| **2** | 只做必填、类型、长度 |
| **1** | 只说"正向和反向" |

**横向对比锚点:**

| 观察点 | 尹宏伟 | Bo Ling | 候选人 C |
|---|---|---|---|
| 开放起手是否先提问 | ✅ 问了 portfolioId 限制、数据源、枚举 | ❌ 一个都没问 | |
| transactionId / 幂等 | 需要解释概念 | 看着材料没发现,由面试官指出 | |
| 对手方相同 | 屏幕没看到 | 未发现 | |
| 方法论是否被提示 | 被提示 | 被提示 | **本场不提示** |

---

## 2. 测试分层(10 分钟)

### 2.1 分层归属题(6 分钟)

> "我们刚才那个建单接口,加上相关的功能,我列了 10 条测试点。**你把它们分别放在哪一层测?** 单元、API、UI/E2E、契约测试,或者不自动化。说一下理由。"

| # | 测试点 | 参考答案 |
|---|---|---|
| 1 | payoff 分段函数在 20 个汇率点上的计算结果(含 146.2 边界) | **单元** —— 纯计算逻辑,组合多,走 API 太慢(这个接口要 60 秒) |
| 2 | 7 个必填字段的缺失、null、空串、错误类型(约 28 条) | **API 参数化** —— 绝不放 UI |
| 3 | 同一 transactionId 重复提交 / 并发提交,只生成一笔 | **API** ⭐ —— 幂等是服务端行为,UI 测不到并发 |
| 4 | 篡改 `X-User-Id` 以他人身份建单被拒 | **API** ⭐⭐ —— 安全校验必须在服务端,UI 上根本改不了 header |
| 5 | 新建的交易出现在 blotter 列表页,字段展示正确 | **UI / E2E,1 条** |
| 6 | 下游风控系统依赖的 trade 响应结构(含 payoffDict) | **契约测试** |
| 7 | maker 建单 → checker 审批 → 状态 APPROVED | **E2E,1-2 条** —— 关键业务主流程 |
| 8 | `.dat` 文件的各种格式错误(空、损坏、字段缺失) | **单元**(解析器)**+ 1 条 API**(确认接入) |
| 9 | novation 的新旧对手方不能相同 | **API**(跨字段校验);若校验器可独立测试,**单元为主 + 1 条 API** |
| 10 | 定价服务超时时,页面给出友好提示且不重复提交 | **UI + mock 上游** |

**打分:**
- 8 条以上与参考一致且理由合理 = 5
- 6-7 条 = 4
- 4-5 条 = 3
- 大部分放 E2E / UI = 2

**关键判定点:**
- **第 4 条** —— 说"UI 层测"的,**没意识到 header 在 UI 上根本改不了**,也没意识到安全校验必须在服务端
- **第 1 条** —— 这个接口要 60 秒,**20 个汇率点走 API 就是 20 分钟**。放在 API 层的,没有成本意识
- **第 3 条** —— 并发提交只能在 API 层构造,UI 做不到
- **第 7 条** —— 能说出"E2E 只保留少数主流程"的,理解测试金字塔

### 2.2 闭合追问(4 分钟)

**Q1.**
> "同一条规则 —— 比如'对手方不能相同' —— 你在单元、API、UI 三层都测了。**这是好事吗?**"

**期望:** 不是。重复测试增加维护成本,规则一改三处都要改。每条规则应在**最低能有效验证它的那一层**测透,上层只验证"接通了"。

**Q2.**
> "你在 Yipitdata 的项目里,单元、API、UI 大概各占多少比例?**如果重新分配,你会怎么调?**"

**看他有没有真实数据,以及对自己现状的反思。**

**Q3.**
> "一条 E2E 用例挂了,但对应的 API 用例和单元测试都是绿的。**说明什么?**"

**期望:** 问题出在层与层的集成处 —— 前端调用方式、参数传递、状态同步、环境配置,或者 E2E 本身不稳定。**好答案会说:这正是 E2E 存在的价值,也是先查 E2E 自身稳定性的理由。**

---

## 3. 代码能力(20 分钟)

### 3.1 代码评审(8 分钟)

> **与尹宏伟使用同一份代码,可横向比较。**

```python
import requests
import time

BASE_URL = "http://trading-uat.internal:8080"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"


def test_place_order():
    r = requests.post(
        BASE_URL + "/api/v1/orders",
        json={
            "account_id": "ACC001",
            "instrument": "EURUSD",
            "side": "BUY",
            "quantity": 100000,
            "price": 1.0850,
            "order_type": "LIMIT",
        },
        headers={"Authorization": "Bearer " + TOKEN},
    )
    assert r.status_code == 200
    global order_id
    order_id = r.json()["order_id"]


def test_order_status():
    time.sleep(5)
    r = requests.get(
        BASE_URL + "/api/v1/orders/" + order_id,
        headers={"Authorization": "Bearer " + TOKEN},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "FILLED"


def test_cancel_order():
    r = requests.delete(
        BASE_URL + "/api/v1/orders/" + order_id,
        headers={"Authorization": "Bearer " + TOKEN},
    )
    assert r.status_code == 200
```

> "团队成员提的 MR,**你会 comment 什么?**" → 追问:"**只能改三处,改哪三处?**"

**埋点(13 项):**

*基础*
- [ ] Token 硬编码 · BASE_URL 硬编码 · `time.sleep(5)` · 断言太弱 · header 重复构造 · 无数据清理

*中级*
- [ ] **`global order_id` → 用例耦合,单独跑第二条 NameError**
- [ ] **无法并行**(上一条的直接后果)
- [ ] **requests 无 `timeout`**
- [ ] 断言失败无上下文

*决定性 ⭐*
- [ ] **`price` 用 float → 应为 Decimal**
- [ ] **业务逻辑矛盾:限价单为何必然 FILLED?已 FILLED 的订单还去撤单**
- [ ] **三个"测试"其实是一个流程的三个步骤**

| 分数 | 表现 |
|---|---|
| 5 | 12 项以上,三项决定性全中 |
| 4 | 9-11 项,指出耦合和并行问题 |
| 3 | 5-8 项,以基础层为主 |
| 2 | ≤ 4 项 |

**"只改三处"的好答案:** token 硬编码(安全)、global 耦合(阻碍并行和单独运行)、float 金额或业务逻辑矛盾(正确性)。**选"重复代码"进前三的,优先级判断有问题。**

---

### 3.2 现场编码 —— 把第 1 节的用例落地(9 分钟)⭐

> **这一节检验他第 1 节说的话能不能写成代码。** 特别看两件事:Q7 说的"封装业务成功断言"有没有做;Q10 说的"参数化"有没有做。

**给他这个客户端接口(假设已存在,不用实现):**

```python
class TradeClient:
    def create_trade(self, trade: dict, dat_file: bytes, user: str) -> Response: ...
        # Response 有 .status_code 和 .json()
    def list_trades(self, transaction_id: str) -> list[dict]: ...
    def delete_trade(self, trade_id: str) -> None: ...
```

> "用 pytest 写三样东西,**不用能跑,写出结构就行**:
>
> 1. **一个构造合法建单数据的方法**,每次调用都能生成一份新的、可以直接用的 payload
> 2. **必填字段缺失的测试** —— 覆盖那 7 个必填字段
> 3. **幂等测试** —— 同一个 transactionId 提交两次,只生成一笔交易
>
> 注意:这个接口业务失败也返回 HTTP 200。"

**参考答案(面试官用,不要给他看):**

```python
import copy
import uuid
import pytest

BASE_TRADE = {
    "transactionId": None,
    "basic": {
        "portfolioId": "ABS_EQF",
        "counterpartyFmId": "300000001",
        "counterpartyName": "10 AM NY",
        "productId": "FX_TRF",
        "direction": "Buy",
        "premiumCurrency": "USD",
        # ...
    },
}
DAT_FILE = b"..."


def make_trade(**basic_overrides) -> dict:
    trade = copy.deepcopy(BASE_TRADE)            # 深拷贝,避免污染模板
    trade["transactionId"] = str(uuid.uuid4())   # 每次唯一
    trade["basic"].update(basic_overrides)
    return trade


def assert_business_success(resp):
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "SUCCESS", body    # 不能只看 HTTP 200
    return body["data"]["trade"]


def assert_business_failure(resp):
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "FAILURE", body
    return body


@pytest.fixture
def client():
    return TradeClient()


@pytest.fixture
def created_trades(client):
    ids = []
    yield ids
    for trade_id in ids:                         # 用例失败也会清理
        client.delete_trade(trade_id)


BASIC_REQUIRED = ["portfolioId", "counterpartyFmId", "productId",
                  "direction", "premiumCurrency"]


@pytest.mark.parametrize("field", BASIC_REQUIRED)
@pytest.mark.parametrize("bad_value", ["__MISSING__", None, ""],
                         ids=["missing", "null", "empty"])
def test_required_basic_field(client, field, bad_value):
    trade = make_trade()
    if bad_value == "__MISSING__":
        del trade["basic"][field]
    else:
        trade["basic"][field] = bad_value
    assert_business_failure(client.create_trade(trade, DAT_FILE, "maker@bank.com"))

# transactionId 与 datFile 不在 basic 内,单独写两条(略)


def test_duplicate_transaction_id_creates_one_trade(client, created_trades):
    trade = make_trade()

    first = assert_business_success(
        client.create_trade(trade, DAT_FILE, "maker@bank.com"))
    created_trades.append(first["id"])

    second_resp = client.create_trade(trade, DAT_FILE, "maker@bank.com")
    # 第二次:返回同一笔,或明确拒绝 —— 以需求为准

    trades = client.list_trades(transaction_id=trade["transactionId"])
    assert len(trades) == 1, trades              # 关键断言:库里只有一笔
```

---

**打分清单:**

*数据构造*
- [ ] **每次生成唯一的 `transactionId`**(uuid)⭐
- [ ] **深拷贝模板**(`copy.deepcopy`)—— 浅拷贝会让嵌套的 `basic` 在用例间互相污染 ⭐⭐
- [ ] 支持按需覆盖字段(`**overrides` 或类似设计)

*断言*
- [ ] **封装了"业务成功/失败"断言**,检查 body 的 `status`,不只看 HTTP 200 ⭐⭐
  **→ 对照第 1 节 Q7:他说了要封装,这里写了吗?**
- [ ] 断言附带响应体,失败时有上下文

*必填字段测试*
- [ ] **用 `parametrize`**,不是 7 个函数或 for 循环里 assert ⭐
  **→ 对照第 1 节 Q10**
- [ ] 区分**缺失 / null / 空串**三种情况(对照第 1 节 Q2)
- [ ] 注意到 `transactionId` 和 `datFile` 不在 `basic` 里,需要单独处理(细节加分)

*幂等测试*
- [ ] **关键断言是"按 transactionId 查,只有一笔"**,而不是只看第二次请求的返回值 ⭐⭐
- [ ] 两次请求用**同一份 payload**(同一个 transactionId)
- [ ] 创建的数据有清理,且放在 yield 之后

---

| 分数 | 表现 |
|---|---|
| **5** | 唯一 ID + 深拷贝 + 封装业务断言 + parametrize + 幂等测试以"查询只有一笔"为断言 |
| **4** | 上面五项做到四项 |
| **3** | 能写出结构,但只断言 HTTP 200,或用 for 循环代替参数化 |
| **2** | 所有用例共享一份 payload,或幂等测试只断言第二次返回了错误 |

**⚠️ 本节最重要的观察 —— 说与做是否一致:**

| 第 1 节他说了 | 第 3 节他写了吗 |
|---|---|
| Q7:要断言 body status / 要封装 | ☐ 写了 ☐ 没写 |
| Q10:要用参数化 | ☐ 写了 ☐ 没写 |
| Q2:缺失、null、空串要分开 | ☐ 写了 ☐ 没写 |
| Q1:幂等要验证只生成一笔 | ☐ 写了 ☐ 没写 |

**说得出、写不出** —— 这是 Bo Ling 那场暴露的模式(架构讲得好,代码里看不见问题)。**四格里有两格以上"说了没写",要重点记录。**

**追问一句(30 秒):**
> "`make_trade` 里,**如果把 `copy.deepcopy` 换成 `BASE_TRADE.copy()`,会出什么问题?**"

**期望:** 浅拷贝只复制最外层,`basic` 这个嵌套 dict 仍然是同一个对象。**一条用例删掉了 `basic["portfolioId"]`,后面所有用例的模板都少了这个字段** —— 而且并行执行时问题更随机、更难排查。

### 3.3 Python 快问(3 分钟)

每题 30 秒,答对打勾:

- [ ] **Q1.** `Decimal(0.1)` 和 `Decimal("0.1")` 有什么区别?
  → 前者把浮点误差带了进来(`0.1000000000000000055…`),后者精确
- [ ] **Q2.** 这段有什么问题?
  ```python
  def build_payload(overrides={}):
      overrides["transactionId"] = str(uuid.uuid4())
      return overrides
  ```
  → **可变默认参数**,所有调用共享同一个 dict,多次调用会互相污染
- [ ] **Q3.** 多个测试文件都要用 `client` fixture,放在哪?
  → `conftest.py`
- [ ] **Q4.** payload 你一般用 dict、dataclass 还是 pydantic?为什么?
  → 开放但看理由:类型校验、默认值、IDE 提示、序列化

---

## ⏸ 决策点

| 前三节平均 | 后续 |
|---|---|
| ≥ 3.5 | 正常完成 4-6 节 |
| 2.5 – 3.5 | 继续,4-6 节每节压到 6 分钟 |
| < 2.5 | 4-6 节每节 5 分钟,只问闭合题,50 分钟结束 |

---

## 4. 数据库(10 分钟)

**给他两张表:**

```sql
-- 新系统
trades (
  id              VARCHAR,   -- 主键,如 TRD-xxx
  transaction_id  VARCHAR,   -- 业务幂等键
  trade_date      DATE,
  ccy             VARCHAR,   -- 币种
  notional        DECIMAL(18,2),
  status          VARCHAR,   -- 可能为 NULL
  version         INT
)

-- 旧系统(迁移源)
legacy_trades (
  legacy_id       VARCHAR,
  txn_ref         VARCHAR,   -- 对应 trades.transaction_id
  trade_date      DATE,
  ccy             VARCHAR,
  notional        DECIMAL(18,2)
)
```

> "这是一次数据迁移,旧系统迁到新系统。**我让你写几条 SQL 做验证。**"

### Q1. 重复数据(2 分钟)
> "找出新系统里 `transaction_id` 重复的记录。"

```sql
SELECT transaction_id, COUNT(*) AS cnt
FROM trades
GROUP BY transaction_id
HAVING COUNT(*) > 1;
```
**判定:** 写出 `GROUP BY ... HAVING` = 通过

### Q2. 漏迁数据(2 分钟)⭐
> "找出旧系统有、新系统没有的交易。"

```sql
SELECT l.*
FROM legacy_trades l
LEFT JOIN trades t ON t.transaction_id = l.txn_ref
WHERE t.id IS NULL;
```
**判定:** `LEFT JOIN ... IS NULL` 或 `NOT EXISTS` = 通过
**⚠️ 如果他写 `NOT IN`,追问 Q5**

### Q3. 金额不一致(2 分钟)
> "找出两边都有、但 notional 不一致的交易。"

```sql
SELECT l.txn_ref, l.notional AS old_notional, t.notional AS new_notional
FROM legacy_trades l
JOIN trades t ON t.transaction_id = l.txn_ref
WHERE l.notional <> t.notional;
```
**加分:** 主动提到币种、trade_date 也要一起比;或提到按币种汇总对账:
```sql
SELECT ccy, SUM(notional) FROM legacy_trades GROUP BY ccy;
-- 与 trades 同样汇总后对比
```

### Q4. NULL 陷阱(1 分钟)⭐
> "`SELECT COUNT(*) FROM trades WHERE status <> 'CANCELLED'`,**status 为 NULL 的行会被算进去吗?**"

**答案:** 不会。NULL 与任何值比较结果都是 UNKNOWN,被 WHERE 过滤掉。
**判定:** 答对 = 通过。这是迁移验证中非常常见的漏数原因。

### Q5. NOT IN 陷阱(1 分钟,进阶)
> "如果用 `WHERE l.txn_ref NOT IN (SELECT transaction_id FROM trades)`,**新表里只要有一行 transaction_id 是 NULL,结果会怎样?**"

**答案:** 返回空结果 —— `NOT IN` 遇到子查询含 NULL 时整体为 UNKNOWN。所以对账推荐 `NOT EXISTS` 或 `LEFT JOIN`。
**判定:** 答对是明确的高分信号。

### Q6. 异步断言(2 分钟)
> "系统是异步写库的,接口返回成功时数据可能还没落地。**你的测试里怎么断言数据库?**"

**期望:** 轮询 + 总超时 + 间隔,超时报错时附带最后一次查询结果;不能用固定 sleep。
**加分:** 提到终态短路(状态已经是 FAILED 就立刻失败,不必等满超时)。

| 分数 | 表现 |
|---|---|
| 5 | Q1-Q4 全对,Q5 或 Q6 至少一题答得好 |
| 4 | Q1-Q3 全对,Q4 答对 |
| 3 | Q1-Q3 基本写对,NULL 相关不清楚 |
| 2 | JOIN 写不出来 |

**注:** 这一节正好对应他简历上的"数据迁移 300+ 数据问题"。**数据迁移做了两个多月的人,Q2-Q4 应该非常熟练。答得吃力要警惕。**

---

## 5. CI/CD(8 分钟)

### 5.1 流水线评审(5 分钟)

**给他这段 GitLab CI:**

```yaml
image: python:latest

variables:
  API_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
  BASE_URL: "http://trade-uat.internal:8089"

stages:
  - test

test:
  stage: test
  script:
    - pip install -r requirements.txt
    - pytest tests/ -n 8
  retry: 2
  allow_failure: true
  only:
    - merge_requests
    - main
```

> "这是一个测试流水线的配置。**你会提哪些修改意见?**"

**埋点(10 项):**

*决定性 ⭐*
- [ ] **`allow_failure: true`** —— 测试挂了流水线照样绿,**质量门禁形同虚设**。这是最严重的一条
- [ ] **token 明文写在 yml 里** —— 应放在 CI/CD 的 masked / protected variables
- [ ] **`retry: 2`** —— 用重试掩盖 flaky;而且 job 级重试是整套用例重跑,成本高、问题被隐藏

*中级*
- [ ] **每个 MR 都跑全量** —— MR 应只跑冒烟/受影响用例,全量放 nightly
- [ ] **没有 artifacts / junit 报告** —— 失败了看不到是哪条、为什么
- [ ] **`python:latest`** —— 镜像不固定版本,构建不可复现
- [ ] **`-n 8` 并行打共享 UAT** —— 数据冲突风险,需要确认用例是否隔离

*基础*
- [ ] 没有 pip 缓存,每次重装依赖
- [ ] 只有一个 stage,没有 lint / 单元测试前置
- [ ] 没有 timeout;`only` 已不推荐,应改用 `rules`

| 分数 | 表现 |
|---|---|
| 5 | 三项决定性全中,尤其**第一个指出 `allow_failure`** |
| 4 | 发现 allow_failure 和明文 token |
| 3 | 发现 token 和 latest,没意识到 allow_failure 的后果 |
| 2 | 只看出 1-2 项 |

### 5.2 闭合追问(3 分钟)

**Q1.**
> "有几条用例 CI 上偶发失败。**你是加 retry,还是别的办法?**"

**期望:** 隔离(打标记放进 quarantine 集合,不阻塞门禁)→ 记录并追踪 flaky 率 → 限期修复。**直接加 retry 且不追踪的,降档。**

**Q2.**
> "**MR 上跑哪些用例,nightly 跑哪些?** 你怎么选?"

**期望:** MR 跑冒烟 + 与改动相关的用例(按标签或按变更路径),控制在 10-15 分钟内;全量、E2E、长耗时用例放 nightly。

**Q3.**
> "**测试报告怎么让开发在 MR 页面上直接看到哪条挂了?**"

**期望:** 生成 junit xml,配置 `artifacts: reports: junit`,GitLab 会在 MR 中展示失败用例。

---

## 6. 排障(10 分钟)

### 6.1 命令快问(4 分钟)

**每题 20-30 秒,答出即打勾。不需要一字不差,思路对即可。**

- [ ] **Q1.** 在 `test.log` 里找出包含 error 或 exception 的行,不区分大小写
  → `grep -iE "error|exception" test.log`
- [ ] **Q2.** 同时显示每个匹配行**之后 5 行**
  → `grep -A 5`(之前用 `-B`,前后用 `-C`)
- [ ] **Q3.** 只统计出现了多少次
  → `grep -c`
- [ ] **Q4.** 实时追踪一个正在写入的日志
  → `tail -f`
- [ ] **Q5.** 看一个 pod 的日志;**pod 已经重启了,看它重启前的日志**
  → `kubectl logs <pod>`;`kubectl logs <pod> --previous` ⭐
- [ ] **Q6.** pod 一直在重启,**怎么看原因**
  → `kubectl describe pod <pod>`,看 Events 和上次退出原因(如 OOMKilled)⭐
- [ ] **Q7.** 从容器里确认数据库的 5432 端口通不通
  → `nc -zv <host> 5432` 或 `telnet <host> 5432`
- [ ] **Q8.** 用命令行复现一个带 JSON body 的 POST 请求
  → `curl -X POST -H "Content-Type: application/json" -d '{...}' <url>`

| 分数 | 答对 |
|---|---|
| 5 | 7-8 题 |
| 4 | 5-6 题 |
| 3 | 3-4 题 |
| 2 | 1-2 题 |

**参照:前两位候选人 Q1 都没答出来。**

### 6.2 场景题(6 分钟)

**场景 A(2 分钟)**
> "用例本地能连上数据库,**CI 上连不上**。你的排查顺序?"

**期望顺序(越接近越好):**
1. 看具体报错 —— 超时、拒绝连接、认证失败、DNS 解析失败,**不同报错指向不同原因**
2. DNS:CI 环境能否解析数据库主机名
3. 网络:从 runner/容器内部测端口(`nc -zv`)
4. 配置:环境变量、凭据是否正确注入到 CI
5. 白名单:数据库是否允许 CI runner 的 IP 访问
6. 资源:连接数是否已满

**判定:** 第一步是"看报错类型"并据此分流 = 高分。**第一步是"找 DevOps"的 = 低分。**

**场景 B(2 分钟)**
> "某个 API **偶发**返回 500,大概 20 次出现 1 次。你怎么定位?"

**期望:**
- 拿到失败请求的 request id / trace id,到服务端日志里找对应的异常堆栈
- 用 curl 以**相同 payload** 复现,判断是**数据相关**(特定输入触发)还是**时序相关**(并发、资源)
- 对比成功与失败请求的差异
- 如果与并发相关,检查连接池、锁、ID 生成

**场景 C(2 分钟)⭐**
> "一条用例**本地单独跑永远通过,CI 上 5 次挂 1 次**。可能的原因?怎么在本地复现?"

**期望的原因:**
- 并行执行时与其他用例**共享数据**冲突
- **依赖执行顺序**(单独跑时状态干净,CI 上被前面的用例污染)
- 时序/等待不足(CI 机器更慢)
- 环境差异

**期望的复现手段:**
- 本地也用 `-n 8` 并行跑
- 打乱顺序跑(`pytest-randomly`),并**固定随机种子**复现
- 重复跑多次(`pytest-repeat` 的 `--count 50`)
- 和 CI 上失败时的**相邻用例**一起跑

**判定:** 能说出"本地加并行 + 打乱顺序 + 重复跑"来复现的 = 5 分。只说"加等待时间"的 = 2 分。

---

## 7. 反问(4 分钟)

> "我这边技术部分就到这里,你有什么想问的?"

---

## 评分汇总表

| 维度 | 分项 | 分数 | 关键证据 |
|---|---|---|---|
| **测试用例设计** | 1.1 开放起手 | | 是否先提问?是否提到幂等和身份? |
| | 1.2 定向追问 | | Q3 对手方 / Q5 身份 / Q9 超时+幂等 |
| | 1.3 优先级 | | 前 5 条是否含幂等和身份 |
| **测试分层** | 2.1 归属题 | | 第 4 条身份伪造、第 1 条 payoff 计算放哪层? |
| | 2.2 追问 | | |
| **代码能力** | 3.1 代码评审 | | Decimal / 业务矛盾 |
| | 3.2 现场编码 | | 业务断言封装 / 深拷贝 / 幂等断言 / **说与做是否一致** |
| | 3.3 Python 快问 | /4 | |
| **数据库** | Q1-Q6 | | NULL 陷阱 |
| **CI/CD** | 5.1 评审 | | allow_failure |
| | 5.2 追问 | | flaky 处理方式 |
| **排障** | 6.1 命令 | /8 | |
| | 6.2 场景 | | 场景 C 复现手段 |

**总体:** ☐ 强烈推荐 ☐ 推荐 ☐ 待定 ☐ 不推荐

---

## 面试官提醒

1. **不给方法论提示。** 不说"等价类""边界值""测试金字塔""分层"。他自己说出来,才是他的。
2. **每题有时限,到点就走。** 答不出来说"没关系,我们看下一题"。
3. **记录他在哪一题开始卡壳,而不只是分数。** 比如代码评审很强但现场编码卡住,说明看得懂写不出;用例设计很强但分层题弱,说明懂测试设计但缺工程成本意识。
4. **业务背景必须念。** 1.0.1 那段背景讲清楚之后,Q3(对手方相同)、Q8(payoff 边界)考的就是逻辑而不是外汇知识。**不讲背景就判他没发现,对他不公平。**
5. **他的强项预判:** 数据库(数据迁移背景)、测试用例设计(数据质量背景)。**这两节答不好,比其他节答不好更值得警惕。**
6. **他的弱项预判:** 本题库用 Python,不考 Java。**Java 迁移意愿需在后续环节单独确认。**
