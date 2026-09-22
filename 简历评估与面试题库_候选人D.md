# 简历评估 + 面试题库 — 候选人 D(SCB China)

**背景:** 13 年经验(2013 至今),四段经历
- **SCB China** —— QA Automation Engineer(2021.11 – 至今,约 5 年)
- 广州亚信科技 —— Test Lead(2019.11 – 2021.08)
- 惠州 Dolphin 技术工作室 —— QA(2015.06 – 2019.07)
- 广州天创时尚鞋业 —— QA(2013.06 – 2015.05)

**岗位:** Senior Test Automation Engineer(FX Structured Products / Post Trade Booking,Java 技术栈)

---

# 第一部分:简历评估

## 一、最重要的发现:他就在 SCB

**他现在的雇主是 SCB China,和你们是同一家银行。** 这件事要最先弄清楚,因为它影响后面所有判断:

| 需要确认 | 为什么重要 |
|---|---|
| **是行内正式员工,还是通过供应商派驻的外包?** | 简历上只写 "SCB China",两种情况都有可能。决定了这是内部转岗还是外部招聘,流程、薪资、背调方式都不同 |
| **如果是内部员工** | 可以按行内流程做内部背调(与现团队主管沟通,需遵循 HR 的内部调动规定);入职成本低,熟悉 ADO、行内框架、合规流程 |
| **为什么想换组** | 内部候选人的动机要问得更细 —— 是想做新东西、想换业务,还是在原团队遇到了问题 |

**⚠️ 提醒自己:不要因为是"自己人"就降低标准。** 用和前三位完全相同的题目和评分表,才公平,也才有可比性。

---

## 二、与岗位的匹配度 —— 纸面上四人中最高

### ✅ 技术栈几乎逐条对上 JD

| JD 要求 | 他的简历 |
|---|---|
| **Java** | ✅ 主力语言,Java + Selenium WebDriver、JUnit、TestNG |
| **BDD / Cucumber(JD 写了两遍)** | ✅ **四人中唯一在实际项目里用 Cucumber 的** |
| Selenium | ✅ 多段经历 |
| Maven | ✅ |
| Azure DevOps | ✅ **JIRA/ADO**,JD 点名的工具 |
| Jenkins | ✅ 声称能搭建环境并编写 pipeline |
| 金融 / 银行背景 | ✅ **SCB 零售银行 + 支付(Scpay)** |
| 性能测试 | ✅ JMeter、LoadRunner,声称做过并发量测算 |
| 数据库 | ✅ DB2、Oracle、MySQL、SQL Server |
| 英文 | ✅ "Able to use English and Cantonese as working language" —— **措辞克制**,且有印尼、越南、南非多国项目协作 |

### ✅ 业务上比前两位更接近

- **Scpay 支付渠道**(印尼、越南、南非多个市场的 API 渠道支付流程)—— 支付系统和交易 booking 一样,**核心问题是幂等、对账、金额精度、状态流转**
- **Keystone 项目:核心系统从 Hogan 迁移到 EBBS** —— 大型核心银行数据迁移,与你们未来可能遇到的历史交易迁移、对账高度相关
- 不是 FX 衍生品,但比风险管理(Bo Ling)和消费数据(候选人 C)近得多

---

## 三、需要验证的疑点

### ⚠️ 1. 他是框架的"使用者"还是"建设者"?(最关键)

SCB 这一段的措辞非常一致:
- "**Mainly participate** in the maintenance of ..."
- "**Good use** UI automation framework ..."
- "**Good use** API automation framework ..."
- "**Participated** in daily interface testing ..."
- "**Participated** in the performance test ..."

**这些措辞很诚实**(对比候选人 C 的 "designed and built"),**但也说明他在 SCB 五年主要是在别人搭好的框架(Genie)上写用例。**

**而你们团队现在要从零搭 API、UI、性能三套框架。** 一个五年只用框架、没建过框架的人,能不能胜任这件事,是本场的核心问题。

早期经历(亚信、Dolphin)写了 "build automate testing architecture",但描述很笼统,需要验证。

### ⚠️ 2. 简历偏重流程与管理

- 证书全是项目管理方向:**PMP、PRINCE2、ACP**(外加一个国内软件测评师)
- 大量流程类描述:"development of the test process"、"standardize test process"、"optimize the work quality of the testing team"
- 亚信是 Test Lead,带两个省的 CMCC 项目测试组

**需要弄清他的职业方向:** 想走技术路线,还是项目管理/交付路线?如果是后者,和你们的 IC 岗位不匹配。

### ⚠️ 3. 技术描述有拼凑痕迹

- **API 框架里列了 Selenium**("Good use API automation framework, Selenium+Genie+Cucumber...")—— Selenium 是 UI 工具
- 早期经历把 **LoadRunner 列为 API 框架**
- 工具清单在多段经历中几乎逐字重复
- 拼写:"Jemter"、"soupUI"、"shell comment"(应为 command)

**单独看都是小问题**,但合起来说明技术描述可能是按"关键词清单"写的,需要面试中确认每一项的实际深度。

### ⚠️ 4. 量化结果几乎没有

全篇只有一个数字:ID、VN、ZA 三个市场的 API 项目共 **1000+ 条用例**。没有回归时长、缺陷数、自动化覆盖率、效率提升等任何结果类数据。

### ℹ️ 5. 其他(不建议作为面试重点)

- **学历:** 广东科学技术职业学院高职专科(2009–2012)+ 中山大学本科(2014.01–2018.07)。本科与工作时间重叠,应为在职取得。**不影响技术评估,不建议在面试中追问。**
- 大专毕业到第一份工作有约 1 年间隔,之后两次换工作各有 3-4 个月间隔。都在正常范围。
- 从 Test Lead(亚信)到 QA Automation Engineer(SCB)是职级上的平移或略降,**进银行时很常见**。

---

## 四、四人横向对比(简历阶段)

| 维度 | 尹宏伟 | Bo Ling | 候选人 C | **候选人 D** |
|---|---|---|---|---|
| **Java** | ❌ | ✅ | ❌ | ✅ |
| **BDD / Cucumber** | ✅ Ruby | 仅列技能 | ❌ | ✅ **实际项目** |
| **ADO** | ✅ | ❌ | ❌ | ✅ |
| **金融业务** | ✅ **FX 衍生品清算** | 风险管理 | 消费数据 | **支付 + 核心迁移** |
| **框架建设经验** | ✅ 自建 | ✅ 自建 | 平台建设 | ⚠️ **主要是使用** |
| 性能 | 有 | 零 | ✅ 最强 | 有 |
| 简历措辞 | 偏强 | 偏强 | 偏强 | **偏谦虚** |
| 面试结果 | 3.0 待定 | 2.5 不推荐 | 2.2 不推荐 | — |

**纸面判断:** 技术栈和 JD 的吻合度四人最高。**最大的未知数是"能不能从零建框架"** —— 这恰好是尹宏伟和 Bo Ling 都证明过、而他需要当面证明的。

---

# 第二部分:面试题库

> **结构:** 英文开场 → 闭合技术题(先硬)→ 决策点 → 开放深挖(后软)
> **时长:** 约 85 分钟

## ⚠️ 面试官执行清单(汲取前三场教训)

- [ ] **提前一天做 5 分钟连线测试**,确认他能共享屏幕;**你作为组织者提前把他设为 presenter**
- [ ] **准备一个免登录的在线编辑器或共享文档**,编码题在里面写,不依赖屏幕共享
- [ ] 所有材料准备**可复制的文本版**
- [ ] **一次只问一个问题**,问完就停
- [ ] **抓住可疑回答往下追**,尤其是随口带过的部分
- [ ] **不给方法论提示**,答不上就说"好,我们看下一题"
- [ ] 核心闭合题连续两道不过,后半程压缩

---

## 时间分配

| 环节 | 时长 | 累计 |
|---|---|---|
| 0. 开场 + 设备确认 | 3 min | 3 |
| 1. 英文段 | 7 min | 10 |
| **2. 闭合技术题** | **38 min** | 48 |
| ——— 决策点 ——— | | |
| 3. 框架与业务深挖 | 20 min | 68 |
| 4. 职业方向与软性能力 | 10 min | 78 |
| 5. 反问 | 5 min | 83 |

---

## 0. 开场(3 分钟)

> "你好,我是 XXX,负责这边的测试。今天大概 80 多分钟:开头用英文聊几分钟,因为我们 leader 和 BA 在新加坡;然后是技术问题,节奏会比较快,**我会给你看一些代码、接口和 SQL**;最后聊聊你的项目和想法,留时间给你问我。
>
> 我可能会中途打断追问,不是挑刺。答不出来直接说就行。
>
> 先确认一下,你能看到我共享的屏幕吗?"

**⚠️ 开场后第一件事 —— 如果 HR 还没确认,你可以轻问一句:**
> "你现在在 SCB 是正式员工,还是通过供应商合作的?"

---

## 1. 英文段(7 分钟)

**基线(2 分钟):**
> *"Tell me about yourself and what you're working on right now at SCB."*

**真实性考点(3 分钟):**
> *"Pick one Scpay payment flow you tested. **Walk me through it end to end** — where does the request come from, which systems does it go through, and where does it end?"*

**这一题同时测英文、业务理解和端到端的边界意识。**

**施压(2 分钟):**
> *"You've worked across Indonesia, Vietnam and South Africa. **What was the hardest thing about testing the same feature in three markets?**"*

然后反驳一次:
> *"Honestly, that sounds like a process problem rather than a testing problem. Convince me otherwise."*

| 分数 | 表现 |
|---|---|
| 5 | 被打断能接住、能反驳、表达连贯 |
| 3 | 能沟通,但简化、倾向顺着说 |
| 2 | 需要反复重复问题,难以完成连贯叙述 |

**参照:** 尹宏伟 3 / Bo Ling 2.5 / 候选人 C 1.5。他简历措辞克制("able to use"),**期望 3 分左右;如果明显高于 3,是加分项。**

> **过渡:** "OK,英文就到这,我们切回中文看一些技术问题。"

---

## 2. 闭合技术题(38 分钟)⭐

> **每题都有可判定答案。答不出就走,不引导。**

---

### 2.1 Java 代码评审(8 分钟)⭐⭐

> **与 Bo Ling 使用同一份代码,可直接横向比较。**

```java
public class TradeBookingTest {

    static WebDriver driver;
    static String tradeId;

    private static final String BASE_URL = "http://trade-uat.internal:8089";
    private static final String TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

    @BeforeClass
    public void setUp() {
        driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(30));
    }

    @Test
    public void testCreateTrade() throws Exception {
        Response r = given()
            .header("Authorization", "Bearer " + TOKEN)
            .contentType("application/json")
            .body("{\"portfolioId\":\"ABS_EQF\",\"productId\":\"FX_TRF\"," +
                  "\"direction\":\"Buy\",\"price\":1.0850}")
            .post(BASE_URL + "/api/v1/trades/create?tradeAction=SAVE");

        Assert.assertEquals(r.getStatusCode(), 200);
        tradeId = r.jsonPath().getString("data.trade.id");
    }

    @Test
    public void testTradeVisibleInUI() throws Exception {
        driver.get(BASE_URL + "/trades/" + tradeId);
        Thread.sleep(5000);
        String status = driver
            .findElement(By.xpath("/html/body/div[2]/div/div[3]/span"))
            .getText();
        Assert.assertEquals(status, "SAVED");
    }

    @Test
    public void testPremiumCalculation() {
        double expected = 0.1 + 0.2;
        double actual = Double.parseDouble(
            driver.findElement(By.id("premium")).getText());
        Assert.assertEquals(actual, expected);
    }

    @AfterClass
    public void tearDown() {
        driver.quit();
    }
}
```

> "团队成员提的 MR,**你会 comment 什么?**" → 追问:"**只能改三处,改哪三处?**"

**决定性埋点 ⭐(Bo Ling 三项全部没看出):**
- [ ] **`static WebDriver` 线程不安全**,并行时共享同一实例 → `ThreadLocal<WebDriver>` 并在结束时 `remove()`
- [ ] **`double` 用于金额 → 应为 `BigDecimal`**;`0.1 + 0.2` 不等于 `0.3`
- [ ] **`assertEquals(double, double)` 没给 delta**

**中级埋点:**
- [ ] `static String tradeId` → 用例耦合,单独跑第二条会拿到 null;依赖执行顺序
- [ ] **隐式等待 30 秒与显式等待混用** —— 所有找不到元素的场景都要卡满 30 秒
- [ ] `Thread.sleep(5000)` → `WebDriverWait` + `ExpectedConditions`
- [ ] **绝对 XPath** → 用稳定的 test-id
- [ ] API 的 `BASE_URL` 被拿去 `driver.get()`
- [ ] API 与 UI 测试塞在同一个类,无分层

**基础埋点:** token / URL 硬编码、JSON 字符串拼接、断言无消息、无数据清理、Rest Assured 无超时

| 分数 | 表现 |
|---|---|
| 5 | 三项决定性全中,12 项以上 |
| 4 | 指出线程安全和 BigDecimal 其一,9-11 项 |
| 3 | 5-8 项,以结构和硬编码为主(**Bo Ling 在这档**) |
| 2 | ≤ 4 项 |

---

### 2.2 Java 快问(4 分钟)⭐

**每题 30-60 秒:**

**Q1. BigDecimal 构造**
> "`new BigDecimal(0.1)` 和 `new BigDecimal("0.1")` 有什么区别?"

→ 前者把 double 的二进制误差带进来(0.1000000000000000055…),后者精确。`BigDecimal.valueOf(0.1)` 也可以。

**Q2. BigDecimal 比较 ⭐⭐(金融场景专属陷阱)**
> "`new BigDecimal("1.0").equals(new BigDecimal("1.00"))` 返回什么?"

→ **`false`**。`equals` 同时比较数值和精度(scale),`compareTo` 才只比数值。**测试里断言金额,要用 `compareTo` 或 AssertJ 的 `isEqualByComparingTo`。**

**这是银行测试人员最该知道、最常踩的一个坑。做了五年支付系统,答不出来要警惕。**

**Q3. Stream**
> "有一个 `List<Trade>`,**用一行 Stream 找出金额大于 1 万且状态为 COMPLETED 的交易。**"

```java
trades.stream()
      .filter(t -> t.getAmount().compareTo(new BigDecimal("10000")) > 0)
      .filter(t -> "COMPLETED".equals(t.getStatus()))
      .collect(Collectors.toList());
```

**加分:** 用 `compareTo` 而不是把 BigDecimal 转 double;写成 `"COMPLETED".equals(status)`(避免 status 为 null 时空指针)。

**Q4. JUnit 生命周期**
> "`@BeforeEach` 和 `@BeforeAll` 有什么区别?**每条用例都要一笔新交易,放在哪个里?**"

→ `@BeforeEach`。放在 `@BeforeAll` 会导致所有用例共享同一笔交易,互相污染。

---

### 2.3 Selenium:按条件定位一行(5 分钟)⭐

> **与候选人 C 的 Playwright 题同一个场景,换成 Selenium,可横向比较。**

> "订单列表页,列有 trade id、amount、currency、status、counterparty、trade date,可能有几千行。**找出金额大于 1 万、状态为 COMPLETED 的那一行,并校验这一行的其他字段。** 用 Selenium 怎么写?"

**期望(任一种合理即可):**
- XPath 按单元格条件过滤行:`//tbody/tr[td[@data-col='status']='COMPLETED']`,再在 Java 里解析金额过滤
- 或 `findElements` 取所有行,用 Stream 按单元格文本过滤(金额要去千分位、用 BigDecimal)

**必问追问:**
> "几千行,还有分页或虚拟滚动,**这个做法还成立吗?**"

→ 好答案:**这种校验不该在 UI 上翻几千行**,应该先用页面的筛选条件或 API 缩小范围,UI 只验证渲染;或者直接在 API/数据库层验证数据,UI 层只验证一两条。**这同时考了测试分层。**

**快问两题:**
- [ ] **怎么等表格加载完?** → `WebDriverWait` 等 loading 消失或行数大于 0;**不用固定 sleep,不混用隐式等待**
- [ ] **`StaleElementReferenceException` 是什么原因?怎么处理?** → 拿到元素引用后 DOM 被重新渲染;重新查找元素、等待稳定状态、不跨刷新缓存元素

**参照:** 候选人 C 先写固定等待、给不出语法、不会按条件过滤。

---

### 2.4 Cucumber / BDD 深度(6 分钟)⭐⭐

> **JD 写了两遍 BDD,他是四人中唯一在实际项目用 Cucumber 的。这一节验证深度。**

**Q1. 状态共享 ⭐**
> "Step definition 分在好几个类里,**一个类里创建的 trade id,另一个类的步骤要用,怎么传?**"

→ 通过依赖注入共享一个场景级的上下文对象(cucumber-spring 的 `@ScenarioScope` bean,或 PicoContainer)。
**⚠️ 答"用 static 变量"的 —— 并行执行时必然出错,和 2.1 里的 static 是同一个问题。**

**Q2. Hooks**
> "`@Before` / `@After` 钩子,**场景失败了 `@After` 还会执行吗?** 怎么让某些钩子只对部分场景生效?"

→ 会执行;用带 tag 的钩子,如 `@Before("@db")`;可用 `order` 控制顺序。

**Q3. 步骤爆炸**
> "项目做久了 step definition 越来越多、越来越重复,**你们怎么治理?**"

→ 步骤写成**业务语义**("When the maker saves the trade")而不是**界面操作**("When I click the Save button");用 Cucumber 表达式参数化;定期清理重复步骤。

**Q4. 谁写 feature 文件?**
> "你们的 feature 文件是谁写的?**BA 或业务方真的会看吗?**"

**这是开放但很有信息量的一问。** 诚实回答"其实都是测试自己写、BA 不看"的,说明他清楚 BDD 在实践中的真实状态 —— **比说"BA 写、大家都看"更可信**。

**Q5. 并行**
> "Cucumber 场景怎么并行跑?并行时要注意什么?"

→ JUnit Platform 的并行配置;每个场景的状态必须隔离,不能用 static。

| 分数 | 表现 |
|---|---|
| 5 | Q1 答依赖注入;Q3 能区分业务语义与界面操作;Q4 诚实 |
| 3 | 会用 Scenario Outline、tag、hooks,但状态共享答 static |
| 2 | 只会写 feature 和 step,说不出机制 |

---

### 2.5 Create Trade API 定向追问(8 分钟)⭐

> 材料与业务背景同候选人 C 题库第 1 节,**背景一定要念**。本场压缩为定向题。

**Q1. 幂等 ⭐⭐(对他是必答题)**
> "`transactionId` 你会怎么测?"

**⚠️ 他做了五年支付渠道。支付系统里"重复扣款"是头号事故,幂等性是最基本的概念。答不出来是明确的红旗。**

期望:重复提交只生成一笔;同 ID 不同 payload 应拒绝;并发同 ID 只生成一笔。

**追问(联系他自己的业务):**
> "Scpay 里,**支付请求超时了,客户端重试,怎么保证不会扣两次钱?你是怎么测的?**"

**Q2.** "`notionalCurrency` 是空字符串,但返回了 SUCCESS,你怎么看?" → 空串、null、缺失三种要分开测

**Q3.** "看一下 counterparty 和 udf 里的 oldCpty,**发现什么?**" → 转让给了自己

**Q4.** "`X-User-Id` 这个 header 你会怎么测?" → 伪造他人身份;身份不应由客户端 header 决定

**Q5.** "业务失败也返回 HTTP 200,**你的断言怎么写?**" → 必须断言 body 的 status,并封装成公共方法

**Q6.** "这个接口要 60 秒才返回,**对你的测试有什么影响?**" → 客户端超时后的幽灵交易;重试与幂等的关系

| 分数 | 表现 |
|---|---|
| 5 | Q1 完整且能联系 Scpay 的超时重试;Q3、Q4 独立发现;**自己把 Q6 和 Q1 串起来** |
| 3 | Q1 答出重复提交,其余需要追问 |
| 1 | 不知道幂等 |

---

### 2.6 SQL:迁移对账(5 分钟)

> **他做过 Hogan → EBBS 核心系统迁移,这一节应该是他的主场。** 表结构同候选人 C 题库第 4 节(`trades` 与 `legacy_trades`)。

- [ ] **Q1.** 找出 transaction_id 重复的记录 → `GROUP BY ... HAVING COUNT(*) > 1`
- [ ] **Q2.** 找出旧系统有、新系统没有的 → `LEFT JOIN ... IS NULL` 或 `NOT EXISTS`
- [ ] **Q3.** 找出两边都有但金额不一致的 → `JOIN ... WHERE l.notional <> t.notional`;**加分:按币种汇总对账**
- [ ] **Q4.** `WHERE status <> 'CANCELLED'`,status 为 NULL 的行算不算? → **不算**
- [ ] **Q5.** `NOT IN` 子查询里有一行 NULL,结果如何? → **返回空**

| 分数 | 表现 |
|---|---|
| 5 | Q1-Q4 全对,Q5 答对 |
| 3 | Q1-Q3 写对,NULL 相关不清楚 |

---

### 2.7 排障 + CI(4 分钟)

**grep(1 分钟)**
> "在 test.log 里找出包含 error 或 exception 的行,不区分大小写,并显示每行之后 5 行。"

→ `grep -iE -A 5 "error|exception" test.log`

**参照:前三位候选人都没有给出完整命令。**

**ADO pipeline 评审(3 分钟)**

```yaml
trigger:
  - '*'

pool:
  vmImage: 'ubuntu-latest'

variables:
  API_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  BASE_URL: 'http://trade-uat.internal:8089'

steps:
  - script: mvn clean test -Dcucumber.filter.tags="@regression"
    displayName: 'Run regression'
    continueOnError: true
```

> "这是一个 ADO 测试流水线,**你会提哪些修改意见?**"

- [ ] ⭐ **`continueOnError: true`** —— 测试失败流水线照样通过,**质量门禁形同虚设**
- [ ] ⭐ **token 明文** → 用 secret 变量、variable group 或 Key Vault
- [ ] ⭐ **任何分支的每次提交都跑全量回归** → PR 跑 `@smoke`,全量 `@regression` 放到定时任务
- [ ] **没有发布测试结果**(`PublishTestResults@2`)→ ADO 里看不到哪条失败
- [ ] 没有 Maven 缓存;没有超时设置

**第一个指出 `continueOnError` 的,理解质量门禁的意义。**

---

## ⏸ 决策点(48 分钟左右)

| 情况 | 后续 |
|---|---|
| 2.1 ≥ 4 且 2.2 Q2、2.5 Q1 通过 | 正常进入第 3、4 节 |
| 2.1 = 3,其余中等 | 继续,第 3 节重点放在 3.1(使用者还是建设者) |
| 2.1 ≤ 2,或不知道幂等 | 第 3 节只保留 3.1,第 4 节只问 4.1,**提前结束** |

---

## 3. 框架与业务深挖(20 分钟)

### 3.1 Genie:使用者还是建设者?(8 分钟)⭐⭐⭐ 本场核心

> **过渡:** "我看你在 SCB 一直用一个叫 Genie 的框架。"

**第一层:**
> "**Genie 本身提供了什么?你们在它上面自己做了什么?**"

**第二层 ⭐:**
> "**你最近一次修改框架本身的代码 —— 不是写用例,是改框架 —— 是什么时候?改了什么?**"

**第三层:**
> "如果 Genie 明天不能用了,**让你用 Java 从零搭一个 API 自动化框架,你怎么分层?第一周交付什么?**"

**期望的分层:** HTTP 客户端封装 → 业务服务层 → 业务动作/数据构造层 → 断言层(含业务状态断言)→ 用例层(Cucumber step);配置按环境分离;测试数据工厂;并行与状态隔离;报告;CI 集成。

**第四层:**
> "你在亚信用的是 **HttpClient**,SCB 里 API 测试用的是什么?**如果让你选,HttpClient 和 Rest Assured 选哪个?为什么?**"

**第五层(验证早期经历):**
> "你在亚信写的是'**build automate testing architecture**'。**具体是你搭的吗?搭了哪些部分?**"

| 分数 | 表现 |
|---|---|
| **5** | 能清楚区分 Genie 提供的和自己做的;有修改框架本身的具体经历;从零分层完整,第一周交付物具体 |
| **3** | 能描述框架结构,但主要是使用;从零分层讲得出但不具体 |
| **1** | 只写 feature 和 step,说不清框架内部 |

**⚠️ 这一题决定他能不能胜任"从零搭框架"。** 3 分以下的话,他更适合一个已有成熟框架的团队。

---

### 3.2 Keystone 核心迁移(6 分钟)

> "Keystone 项目,从 Hogan 迁到 EBBS。**你的验证策略是什么?**"

**追问链(挑 2-3 个):**
- "**条数对上了,但金额总和对不上,你从哪里开始查?**" ⭐
- "旧系统和新系统的数据模型不同,**字段映射你怎么验证?**"
- "切换那一刻,**旧系统还在产生的增量数据怎么验?**"
- "你在这个项目里**发现过最严重的问题是什么?**"
- "性能测试(PT)测的是什么?迁移后跑批时间变了吗?"

**最后一问可以问:** "**上线后有没有漏掉的问题?为什么当时没发现?**"

---

### 3.3 多市场支付(6 分钟)

> "同一个 Scpay 的 workflow enhancement,要在印尼和越南两个市场上线。**你的用例怎么复用、怎么区分?**"

**期望他能说到的市场差异:**
- **币种小数位不同** —— 例如越南盾没有小数位,南非兰特有两位 ⭐(与你们 FX 业务直接相关)
- **时区与日切时间**(cut-off time)
- 当地节假日
- 当地监管要求的字段和校验
- 渠道和对接方不同

**复用方式:** Scenario Outline + 按市场的 Examples;按市场的配置文件;tag 区分市场。

**追问:**
> "**有没有一个 bug 是只在某一个市场出现的?**"

**这一题同时考测试设计、BDD 的实际用法和业务敏感度。**

---

## 4. 职业方向与软性能力(10 分钟)

### 4.1 为什么想动(必问)

> "你在 SCB 五年了。**为什么现在想换?**"

**如果是内部转岗:**
> "你现在的团队知道你在看其他机会吗?"(确认内部流程是否合规)

### 4.2 职业方向 ⭐

> "你考了 PMP、PRINCE2、ACP,之前也做过 Test Lead。**未来三年,你想走技术路线,还是项目管理或交付方向?**"

**我们的岗位是 IC,要大量写代码、搭框架。** 如果他明确想转管理,即使技术合格也会有留存风险。

### 4.3 失败案例(必问)

> "讲一次你漏测到 UAT 或生产的事故。根因是什么,之后你改了什么?"

| 分数 | 表现 |
|---|---|
| 5 | 具体事件,主动承担,有机制性改进 |
| 3 | 有事件,但归因于外部 |
| 1 | 给不出具体事件 |

### 4.4 落差与工作内容

> "我们是新团队,现在只有我一个 QA,你进来是第二个。**除了搭框架,还有大量日常测试、写用例、跟需求。你能接受吗?**"

---

## 5. 反问(5 分钟)

**你要主动说清:**
1. IC 岗,团队只有两个 QA
2. **API、UI、性能三套框架都要从零搭** —— 和他现在"在成熟框架上写用例"的状态不同
3. 业务是 FX 结构化产品的交易后处理

---

## 评分表

| 维度 | 权重 | 分数 | 关键证据 |
|---|---|---|---|
| 英文 | 中 | | |
| **2.1 Java 代码评审** | **高** | | 线程安全 / BigDecimal |
| 2.2 Java 快问 | 高 | /4 | **Q2 equals vs compareTo** |
| 2.3 Selenium 定位 | 中 | | 是否想到分层 |
| **2.4 Cucumber 深度** | **高** | | 状态共享的方式 |
| **2.5 API 定向(幂等)** | **高** | | 能否联系 Scpay |
| 2.6 SQL 对账 | 中 | | NULL 陷阱 |
| 2.7 grep + CI | 中 | | continueOnError |
| **3.1 使用者 vs 建设者** | **决定性** | | 是否改过框架本身 |
| 3.2 迁移 | 中 | | |
| 3.3 多市场 | 中 | | 币种小数位 |
| 4.2 职业方向 | 高 | | 技术 or 管理 |
| 失败案例 | 高 | | |

**总体:** ☐ 强烈推荐 ☐ 推荐 ☐ 待定 ☐ 不推荐

---

## 四人同题对比锚点

| 题目 | 尹宏伟 | Bo Ling | 候选人 C | **候选人 D** |
|---|---|---|---|---|
| Java 代码评审(线程安全 / BigDecimal) | 未测 | ❌ 两项都没看出 | — | 2.1 |
| 幂等性 | 1 | 3 | 1 | 2.5 Q1 |
| 按条件定位表格行 | — | — | ❌ Playwright | 2.3 Selenium |
| grep 命令 | ❌ | ❌ | 部分 | 2.7 |
| SQL 对账 | — | — | 3 | 2.6 |
| 从零建框架 | ✅ | ✅ | 部分 | **3.1** |
| 英文 | 3 | 2.5 | 1.5 | 1 |
