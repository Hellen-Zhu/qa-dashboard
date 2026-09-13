# Senior Test Automation Engineer — 面试手册


---

## 时间分配

| 环节 | 时长 | 考察重点 |
|---|---|---|
| 0. 开场与背景 | 5 min | 破冰、职业动机 |
| 1. 简历验真 | 10 min | 真实性、职责边界 |
| 2. 测试用例设计 | 15 min | 分析能力、覆盖思维 |
| 3. API 接口自动化 | 15 min | 核心技术深度 |
| 4. UI / E2E 自动化 | 10 min | 已知短板,重点验 |
| 5. 性能测试 | 10 min | 强项,验真为主 |
| 6. CI/CD 与质量门禁 | 10 min | 工程化能力 |
| 7. 软性能力(行为面) | 15 min | 能力模型打分 |
| 8. 反问与收尾 | 10 min | 动机、留存风险 |

> **提示:** 全程边问边记证据,不要等面完凭印象打分。技术题答得漂亮时,第 7 部分极易被光环效应拉高,而这恰恰是该候选人简历最空的部分。

---

## Part 0 — 开场与背景(5 分钟)

1. 用三分钟介绍一下你目前在做的项目,以及你在团队里具体负责哪一块。
2. 你现在团队多少人?测试几个人?你是负责整个自动化体系还是其中某个模块?
   请把你测的这条链路从头到尾画一遍：上游数据从哪进来（交易所成交文件 / FIX / 清算所接口），中间经过哪些系统，下游出到哪（总账、结算指令、监管报送、客户对账单）？
   你的端到端校验，校的是哪几层？界面、数据库、接口报文、批处理产出文件？各层各占多少？
   "全生命周期"——如果按天排，一笔期货合约从成交到交割，一共有多少个状态节点？
3. 这段和上一段的性质不一样：上一段是**数字**，可以逐个拷问口径；这段是**广度声明**——"全生命周期""涵盖期货与期权""含外汇衍生品"。对付广度声明的标准打法是**用广度钓深度**：让他自己挑一个最熟的环节讲透，然后面试官再随机抽一个他没挑的环节问同样深度，看落差有多大。真做过的人各环节深浅差不多，背简历的人只有一两个点能撑住。

## 开场定位（先画地图）

- 请把你测的这条链路从头到尾画一遍：上游数据从哪进来（交易所成交文件 / FIX / 清算所接口），中间经过哪些系统，下游出到哪（总账、结算指令、监管报送、客户对账单）？
- 你的端到端校验，校的是哪几层？界面、数据库、接口报文、批处理产出文件？各层各占多少？
- "全生命周期"——如果按天排，一笔期货合约从成交到交割，一共有多少个状态节点？

第三问很有效：答得出具体节点数和名字的是真做过，答"就是那几个阶段"的基本露馅。

## 按环节逐个下钻

**Novation（交易更替）**

- 更替发生在哪个时点？交易所撮合后立刻，还是清算所接受（acceptance）之后？
- 更替后记录里到底哪些字段变了？对手方变成 CCP 之后，原始对手方信息还留吗？
- 更替失败的场景你怎么造？（会员风控额度不足、账户无效、合约未挂牌）失败之后持仓和资金要回滚到什么状态，你怎么验证没有脏数据？
- 你们是 novation 模型还是 open offer 模型？测试上有什么差别？

**交易修改（amendment / give-up）**

- 修改一笔**已经参与过日终清算**的交易会发生什么？重算盈亏？追溯调整保证金？还是只做当日差额调整？
- Give-up / take-up 的测试怎么设计？转出方和转入方的持仓、保证金、手续费分别怎么变？
- 如果 give-up 被接收方拒绝，持仓停在哪一方？超时未处理呢？

**持仓生命周期**

- 净持仓（net）和总持仓（gross）你都测了吗？什么情况下系统按净、什么情况下按总？
- 平仓的配对规则是 FIFO 还是客户指定？你怎么验证平仓盈亏用的成本价是对的？
- 自营账户和客户账户隔离，你有没有专门的用例？两边混账会怎么被发现？
- 期权的行权与被指派（assignment）：自动行权的 ITM 判定边界（正好等于行权价怎么办）、客户主动弃权、指派的分配算法（随机 vs 按比例），你覆盖到哪一层？

**每日清算**

- 结算价怎么来的？收盘集合竞价、加权均价，还是流动性不足时用理论价？异常情况（涨跌停、停牌、无成交）你造过用例吗？
- 期权是权利金全额支付（premium-style）还是期货式保证金（futures-style）？这两种的盯市逻辑完全不同，你测的是哪种，两种都有吗？
- 日切（business date rollover）在自动化里怎么处理？改系统时间？调批处理接口？多日连续场景（D 日建仓 → D+1 盯市 → D+2 平仓 → D+3 交割）怎么编排和回滚？

**保证金**

- 初始保证金用的什么模型？SPAN、SPAN 2，还是交易所自有？
- **期望值哪来的？**——这是整段里最关键的一问。你是自己独立实现了一遍算法做影子计算，还是拿系统输出当基线只比字段？如果是后者，那你校验的到底是什么？
- 跨品种对冲减免（inter-commodity spread credit）、组合保证金你验过吗？怎么构造一个能触发减免的组合？
- 日间追保（intraday margin call）、抵押品折扣率（haircut）、非现金抵押，这些在你的覆盖范围里吗？

**交收与交割**

- 实物交割：首次通知日、最后交易日、配对分配（tender/allocation），这条线你怎么测？
- 现金交割用什么最终结算价？和每日结算价来源一样吗？
- 交割失败（fail）怎么处理，有没有罚息，你验过吗？

## 外汇衍生品专项（他自己写上去的，必问）

- 交易所挂牌的外汇期货，报价方向和合约乘数怎么校验？反向报价的品种（比如以美元为标价 vs 以美元为基础货币）盈亏符号搞反了你能发现吗？
- 结算货币和保证金货币不一致时，折算汇率取哪个时点？你怎么验？
- 双边货币的节假日日历——两个货币任一方休市，value date 顺延规则你测过吗？
- T+2 spot convention 在交割日计算里怎么体现？

## 测试工程本身的硬题

- 你的预期结果（test oracle）怎么产生的？独立重算、历史基线、业务方提供的期望值表，还是黄金数据集？
- 金额比对的容差和舍入规则怎么定的？四舍五入 vs 银行家舍入，货币最小单位，合约乘数相乘后的精度损失——你在断言里怎么处理？
- 期货期权成千上万个合约，你怎么选测试标的？是每个 product family 抽样，还是数据驱动全跑？
- 这些用例现在还在跑吗？一次全量多久？谁维护？

---

**红旗信号**：只能讲清楚一两个环节、被问到保证金期望值时说"和系统跑出来的对比"、说不出任何一个具体的结算价异常场景、外汇部分只会说"就是汇率转换一下"、把"我看过这些流程"讲成"我测过这些流程"。

要不要我挑其中最容易被问倒的几条（保证金的 oracle、日切编排、外汇报价方向）帮你把答案组织一遍？或者你后面还有别的条目，我可以一起整理成一份完整的面试准备清单。

**观察点**
- 能否在三分钟内讲清楚,而不是流水账
- "我们做了" vs "我做了" 的边界是否清晰
- 是否主动提到自己不负责的部分(说明诚实)

**需要确认的事实**
- DingChi Technology 是甲方还是外包/驻场到港交所项目?
- 离开 Saxo 的真实原因(在那里 3.5 年,是他最长的一段)
- 期望薪资(简历 10+ 年经验,JD 写 3-8 年,存在超配风险)
- 工作地点与到岗时间

---

## Part 1 — 简历验真(10 分钟)

### 1.1 最近项目的量化基线

> 你现在这个清算项目,一轮完整回归跑多久?多少条用例?通过率和误报率(flaky rate)大概多少?

**为什么问:** 简历上最近一份工作(2025.01 至今)没有任何数字,反而 3 年前的经历有"30 天→1 周""100 个高危缺陷""90% 覆盖"。真正在一线跑回归的人,这些数字是脱口而出的。

| 分数 | 表现 |
|---|---|
| 5 | 数字精确,能说出趋势变化和当前瓶颈 |
| 3 | 有大致数字,细节模糊 |
| 1 | 完全答不上来,或说"没统计过" |

### 1.2 Black-Scholes 结算价(最能区分真懂业务 vs 抄公式)

> 你提到用 Black-Scholes 期权定价和 cost-of-carry 期货定价生成确定性的结算价输入。
> **波动率和无风险利率分别从哪来?**

**追问链:**
- 你怎么确认自己算出来的期望值是对的,而不是复刻了被测系统的同一套逻辑?(测试 oracle 的独立性)
- 如果你算的结果和系统结果差 0.0001,你怎么判断是谁错了?容差怎么定的?
- 这个容差是你定的还是业务定的?

| 分数 | 表现 |
|---|---|
| 5 | 理解 oracle 独立性问题,有明确容差策略和分级判定,能说出数据来源 |
| 3 | 能讲清实现,但没意识到"用同一逻辑验证"的陷阱 |
| 1 | 只能说"跟开发对一下"或"按需求文档" |

### 1.3 90% 的来源

> "接口变更适配成本降低约 90%" —— 这个基线是什么?怎么测出来的?

**追问:** 客户端是构建期生成还是运行时生成?schema 变更导致用例失败时,怎么区分是"接口真的坏了"还是"我们的生成器没跟上"?

---

## Part 2 — 测试用例设计能力(15 分钟)

### 2.1 现场设计题(核心)

> 给你一个**限价单下单 API**,我们做外汇和期货交易。接口大致是:
>
> ```
> POST /api/v1/orders
> {
>   "account_id": "...",
>   "instrument": "EURUSD",
>   "side": "BUY" | "SELL",
>   "order_type": "LIMIT",
>   "quantity": 100000,
>   "price": 1.0850,
>   "time_in_force": "GTC" | "IOC" | "FOK" | "DAY",
>   "client_order_id": "..."
> }
> ```
>
> 需求只有一句:"用户提交限价单,系统校验后进入订单簿,返回订单状态。"
>
> **给你 8 分钟,说出你会怎么设计测试用例。不用写完,讲你的思路和分层。**

**优秀答案应覆盖的维度(用作 checklist,勾选打分):**

- [ ] **先问问题再动手** —— 撮合规则?账户保证金怎么算?交易时段?涨跌停?这是最强信号
- [ ] **等价类 / 边界值** —— quantity 最小交易单位、price tick size、精度截断/四舍五入
- [ ] **业务规则** —— 保证金不足、账户被冻结、超出持仓限额、非交易时段、标的已停牌
- [ ] **状态机** —— 订单生命周期:New → PartiallyFilled → Filled / Cancelled / Rejected,非法状态跃迁
- [ ] **TIF 语义差异** —— IOC 和 FOK 在部分成交时的不同行为(这题很能区分懂不懂交易)
- [ ] **幂等性** —— client_order_id 重复提交会怎样?这是交易系统的必考点
- [ ] **并发** —— 同账户同时下多单、余额竞态
- [ ] **数据一致性** —— 下单后持仓、可用资金、订单簿、下游统计是否同步
- [ ] **异常与恢复** —— 下游撮合引擎超时后订单状态是什么?消息丢失怎么补偿?
- [ ] **分层判断** —— 哪些放单元测试、哪些 API 层、哪些必须 E2E,理由是什么
- [ ] **优先级** —— 如果只有半天时间,先跑哪 10 条

| 分数 | 表现 |
|---|---|
| 5 | 先澄清需求;覆盖 8 项以上;主动讲分层和优先级取舍;提到幂等和状态机 |
| 4 | 覆盖 6-7 项,结构清晰,但缺取舍思维 |
| 3 | 只有正常流 + 基本边界值,业务维度薄 |
| 2 | 罗列输入校验,看不出测试设计方法论 |

### 2.2 取舍追问

> 假设产品说"这个版本三天后必须上线",你只能跑三分之一的用例。你怎么选?你会跟谁说、怎么说?

**观察点:** 有没有风险分级的概念(变更影响面 × 业务损失),有没有"把风险说清楚让业务决策"而不是自己扛或一味拒绝。这同时是 **Decision Quality** 和 **Courage** 的取证机会。

---

## Part 3 — API 接口自动化(15 分钟)

### 3.1 框架设计

> 让你从零搭一套 API 自动化框架,给一个 20 人的团队用,覆盖 REST + GraphQL。你会怎么分层?

**期待听到:** 传输层 / 业务封装层 / 数据层 / 断言层 / 用例层的分离;配置与环境管理;认证 token 的统一处理;请求日志与失败证据留存。

**追问:**
- 测试数据怎么管理?每次跑都造新数据,还是复用固定数据?各自的问题是什么?
- 用例之间有依赖(下单→查询→撤单)怎么办?你是让用例串起来,还是每条都自给自足?代价是什么?

### 3.2 断言的深度(高区分度)

> 很多人的 API 用例只断言 HTTP 200 和几个字段。你怎么保证断言真的能抓到 bug?

**追问:**
- 响应里有 20 个字段,你全断言还是断言关键几个?全断言的问题是什么?
- 你怎么做 schema / contract 校验?契约变更了但业务逻辑没变,用例应不应该挂?
- **数据库校验:** 接口返回成功,但库里落的数据是错的,你怎么发现?你的 SQL 断言写在哪一层?

| 分数 | 表现 |
|---|---|
| 5 | 区分契约校验与业务校验;有分层断言策略;主动讲 DB/下游一致性校验 |
| 3 | 知道要校验字段和数据库,但没有体系 |
| 1 | 只停留在状态码和几个字段 |

### 3.3 异步与协议(对应 JD preferred)

> 我们系统里有 REST、gRPC 和 WebSocket,还有消息队列。下单是同步返回,但成交回报是异步推过来的。这种场景你的自动化怎么写?

**追问:**
- 你怎么等这个异步消息?硬 sleep 吗?超时怎么定?
- 同时有多笔订单在跑,推过来的回报怎么和用例对上号?
- 测试失败时你怎么判断是"消息没来"还是"消息来了但内容不对"?

**注:** 候选人有 FIX、MQTT 经验(都是异步协议),gRPC/WebSocket 没写。这题看的是**能否迁移**,不是有没有用过这两个具体协议。

### 3.4 语言栈迁移(关键决策题)

> 我们的框架是 Java / TypeScript 写的,REST-assured + Maven。你主力是 Python 和 Ruby。给你两周,你怎么做?第一周结束时你能交出什么?

| 分数 | 表现 |
|---|---|
| 5 | 主动讲路径:先读现有仓库和 CI、先补一条最小可运行用例、承认前两周会慢;能类比 Python 里的等价概念 |
| 3 | 表示能学但说不出具体步骤 |
| 1 | 说"语言都一样,很快就能上手"(低估成本,也是自我认知问题) |

**注意:** 如果你们代码库强制 Java/TS,这题基本决定录用与否,不要含糊过去。

---

## Part 4 — UI / E2E 自动化(10 分钟)

> **背景:** 候选人整体偏后端/API/数据,UI 只有 SaxoTraderGo 一条 Playwright 经历。JD 明确要求 UI/E2E 覆盖关键用户旅程 + flaky 分诊。这是最需要验的短板。

### 4.1 规模验真

> 你在 SaxoTraderGo 那套 Playwright 用例,大概多少条?跑一轮多久?你是搭框架的人还是写用例的人?

### 4.2 Flaky(JD 明确列出的职责)

> 一条 UI 用例本地跑 10 次都过,CI 上三次挂两次。你怎么查?

**期待听到:** 先看失败证据(截图/video/trace)→ 区分是环境、数据、时序还是真 bug → 检查是否有隐式等待或固定 sleep → 检查用例间数据污染 → 检查并行执行的资源竞争。

**追问:**
- Playwright 的自动等待已经很强了,为什么还会 flaky?你遇到过哪几类?
- 你怎么统计 flaky 率?有没有做过失败自动归类?
- 一条用例反复 flaky,修了三次还是不稳,你怎么处理?

| 分数 | 表现 |
|---|---|
| 5 | 有系统的分诊流程;区分"重试掩盖问题"和"合理重试";能举具体案例 |
| 3 | 知道用 trace 和重试,但没有体系 |
| 1 | 第一反应是"加 sleep"或"加重试次数" |

### 4.3 选择器与可维护性

> 前端重构了一次,你的 UI 用例挂了一半。怎么避免这种事再发生?

**期待听到:** 稳定的 test-id 约定并推动前端团队落地(这里也是 **Collaborates** 的取证点);页面对象/组件封装;把断言建立在业务语义而不是 DOM 结构上。

### 4.4 分层判断

> 哪些场景你**坚决不用** UI 自动化?为什么?

**观察点:** 这题在看他有没有测试金字塔的概念,以及敢不敢说"不做"。答"什么都能自动化"是减分。

---

## Part 5 — 性能测试(10 分钟)

> **背景:** 这是候选人的强项(Locust 百万连接、BSS 400 并发、Prometheus/Grafana),以验真和深度为主。

### 5.1 数字的来源

> BSS 你压到 400 并发连接。**为什么是 400?** 这个数是业务峰值推出来的,还是环境能扛到的上限?

| 分数 | 表现 |
|---|---|
| 5 | 从业务量反推(峰值 TPS × 安全系数),能说出推算过程 |
| 3 | 说是业务方给的,但能解释背景 |
| 1 | 说"压到挂为止"或含糊带过 |

### 5.2 瓶颈定位

> 那次压测最后瓶颈定位在哪?你是怎么一步步缩小范围的?

**追问:**
- 你看哪几个指标?延迟你看平均值还是分位数?为什么?
- 你怎么确认瓶颈是被测系统而不是你的压测客户端?
- 定位到之后,开发改了吗?改完复测效果如何?

### 5.3 标准制定

> 你说和业务、工程团队一起定义了延迟和吞吐 KPI。**具体是谁提的?过程中有分歧吗?**

**观察点:** 这题同时取证 **Collaborates** 和 **Courage**。如果他能说出"业务想要的指标不现实,我拿数据说服了他们",是高分信号。

### 5.4 常态化

> 性能测试是一次性的项目验收,还是进了流水线常态跑?如果没进,为什么?

---

## Part 6 — CI/CD 与质量门禁(10 分钟)

### 6.1 流水线设计

> 你在 GitLab 上搭的多阶段流水线,协调 start-of-day、测试数据创建、session 自动化、批处理检查点。**画一下或描述一下这个流水线的阶段划分。**

**追问:**
- 每个阶段多久?整条跑完多久?
- 中间某个阶段挂了,后面怎么办?能断点续跑吗?
- 前一天的数据影响后一天,怎么保证可重复?

### 6.2 质量门禁(JD 明确要求)

> 你在 Azure DevOps 里嵌了质量门禁。**门禁的具体规则是什么?卡什么指标?**

**追问:**
- 谁定的阈值?
- 如果有人急着发版,门禁挂了,他来找你放行,你怎么处理?**(高价值追问 —— 直接取证 Courage)**
- 你有没有见过门禁形同虚设的情况?为什么会那样?

| 分数 | 表现 |
|---|---|
| 5 | 门禁规则具体;有明确的例外流程(谁有权批、怎么记录);敢于举自己坚持不放行的例子 |
| 3 | 有门禁但规则来自别人,例外处理靠人情 |
| 1 | 说不出具体规则 |

### 6.3 反馈速度

> 开发提一个 MR,多久能拿到自动化反馈?如果超过 20 分钟,你会怎么优化?

**期待听到:** 用例分层分级(冒烟 vs 全量)、并行化、按变更范围裁剪用例、把慢用例移到夜间、容器化环境准备。

### 6.4 AI 辅助的边界(对应 JD preferred,也是风险点)

> 你用 GenAI 生成校验逻辑和 BDD 场景。**出过什么错?**

**追问(关键):** AI 生成的断言,如果恰好和被测代码的实现是同一个错误理解,你怎么防?

| 分数 | 表现 |
|---|---|
| 5 | 清楚知道 AI 生成断言的 oracle 污染风险;有明确的人工评审规则和边界(哪些能让 AI 写、哪些绝不能) |
| 3 | 说"都会人工 review",但说不出具体标准 |
| 1 | 只讲效率提升,完全没意识到风险 |

---

## Part 7 — 软性能力 / 行为面(15 分钟)

> **规则:** 每一题都必须落到一个**具体事件**(时间、人、做了什么、结果)。答不出具体事件的,该项不得高于 3 分。

### 7.1 Courage —— 优先级最高

> **讲一次你判断错了、漏测到 UAT 或生产的事故。根因是什么?你当时怎么处理的?之后改了什么?**

| 分数 | 表现 |
|---|---|
| 5 | 具体事件,主动承担,说得清根因,之后有机制性改进 |
| 3 | 有事件,但责任大部分归于外部(需求变更、环境、开发) |
| 1 | 推得干干净净,或说"想不起来" |
| **红旗** | 坚称自己没漏过重大缺陷 |

> 再讲一次:你的技术方案被否掉,或者你明知会得罪人但还是必须说出口的场合。

**背景说明:** 该候选人简历通篇是"主导/设计/架构",没有一处体现取舍、局限或失败。如果面试中他每题都答得顺滑完美、没有一处承认边界,应该**降档**评估而不是加分。

### 7.2 Develops Talent —— 简历零证据,必须当面问

> **你带过人吗?具体说一个:这个人当时的短板是什么,你做了什么,三个月后他变成什么样?**

> 代码评审时,一个初级同事写的用例断言太弱(只断言了状态码)。你怎么给反馈?

| 分数 | 表现 |
|---|---|
| 5 | 有具体的人、具体的干预动作、可验证的变化 |
| 3 | 做过分享/写过文档,但没有针对个人的培养 |
| 2 | 完全没有 |

**注意:** JD 白纸黑字写了"Mentor junior QA engineers"。这项没有就是没有,不要因为技术强而放水。

### 7.3 Decision Quality

> 你做过的技术选型里,挑一个:当时还有哪些备选方案?你为什么没选它们?**现在回头看,那个决定对吗?**

**观察点:** 能说出被放弃的选项和放弃理由,才是真做过决策。只讲结论的人多半是执行者。

### 7.4 Collaborates

> 你提了一个缺陷,开发坚持说"设计如此"。讲一次这种冲突,最后怎么收场的。

> 你和业务方对"什么算通过"理解不一致时,怎么办?

### 7.5 Manages Ambiguity

> 清算规则文档不全、BA 也说不清楚,你怎么推进?举一个具体的。

> 加入一个陌生项目,没人有空带你,前两周你怎么安排?

### 7.6 Customer Focus(此岗位的"客户"= 开发和业务)

> 你怎么知道你的自动化对团队真的有用,而不是只有你自己在用?

**期待听到:** 有人用、有人看报告、有人因为它改变了行为;而不是"覆盖率多少"。

### 7.7 顺带观察(不单独提问,从全程取证)

- **Instills Trust** —— 全程是否夸大、是否把团队成果说成自己的、追问细节时是否闪烁
- **Nimble Learning** —— 从 3.4 语言迁移和 6.4 AI 两题取证
- **Action Oriented** —— 从 1.1 数字题取证
- **Drives Vision / Gives Clarity / Strategic Mindset** —— 这三项本质是管理层能力,IC 岗位给 3 分是正常的。**只在他明确展示出"推动过团队级规范落地"时才给 4-5,不要用管理者标准误判一个 IC。**

---

## Part 8 — 反问与收尾(10 分钟)

1. 你有什么想问我们的?
2. 如果你入职,前 90 天你想做成什么?
3. 你理想中下一步的职业方向是什么 —— 继续深耕技术,还是走管理?

**观察点(留存风险评估):**
- 他问的问题质量:问团队现状、技术债、质量流程的 > 问薪资福利的 > 没问题的
- 10 年经验投一个 3-8 年的岗位,如果他 Strategic Mindset 和 Courage 都很高,**反而要担心留存** —— 这种人进来半年可能会闲
- 反过来,如果他对 UI 和 Java/TS 的态度是"这不是我该做的",契合度要打问号

---

## 附录 A — 评分表

面完当场填,不要过夜。

| 维度 | 权重 | 证据(必填) | 1-5 |
|---|---|---|---|
| **Technical Competencies** | | | |
| ├ 测试用例设计 | 高 | | |
| ├ API 自动化深度 | 高 | | |
| ├ UI / E2E 能力 | 高 | | |
| ├ 性能测试 | 中 | | |
| ├ CI/CD 与质量门禁 | 中 | | |
| └ 语言栈迁移能力 | **决定性** | | |
| Courage | 高 | | |
| Develops Talent | 高 | | |
| Decision Quality | 高 | | |
| Collaborates | 中 | | |
| Manages Ambiguity | 中 | | |
| Customer Focus | 中 | | |
| Action Oriented | 中 | | |
| Instills Trust | 中 | | |
| Nimble Learning | 中 | | |
| Drives Vision & Purpose | 低(IC) | | |
| Gives Clarity & Guidance | 低(IC) | | |
| Strategic Mindset | 低(IC) | | |

**总体结论:** ☐ 强烈推荐 ☐ 推荐 ☐ 待定(需补充面试) ☐ 不推荐

**如录用,需要的入职支持:**

---

## 附录 B — 红旗清单

出现以下任一情况,需要在评语里明确标注:

- ☐ 说不出最近项目的回归时长 / 用例数 / 通过率
- ☐ 声称从未漏过重大缺陷,或无法举出任何失败案例
- ☐ Black-Scholes 那题只能说"跟开发核对",不理解 oracle 独立性
- ☐ 认为语言迁移"很简单,一周就行"
- ☐ Flaky 的第一反应是加 sleep 或加重试
- ☐ 完全没有带人 / 评审 / 知识传递的具体事例
- ☐ 把所有成果都说成自己主导,没有一处提到团队或他人
- ☐ 追问技术细节时,描述从具体变模糊
- ☐ 期望薪资显著超出 band,且对此没有合理解释

---

## 附录 C — 候选人已知画像(供面试官参考)

**明确强于 JD 要求:**
- FX / 交易 / 清算领域(JD 仅 preferred,他是 10 年主线)
- 性能与负载测试(JMeter、Locust、400 并发实测)
- AI 辅助测试生成(JD preferred)
- CI/CD 质量门禁 + Azure DevOps
- BDD / Gherkin(Ruby-Cucumber + pytest-bdd)

**明确的空缺,需重点验证:**
- 语言栈:Python / Ruby 为主,Java 仅 "working knowledge";REST-assured、Maven、Postman 全篇未提
- UI 自动化偏薄,仅一条 Playwright 经历
- Mentoring 零提及(JD 硬性要求)
- gRPC / WebSocket 未提(有 FIX / MQTT,可迁移)

**结构性风险:**
- 10+ 年经验投 3-8 年岗位 → 薪资超配 + 留存风险
- 最近一份工作(9 个月)零量化结果,数字全在 3 年前
- 简历通篇无取舍、无失败、无边界 → 需在面试中主动压测

---

## 附录 D — 英文能力评估(15 分钟,嵌入式)

### D.0 先定标准:这个岗位到底需要什么英文

不要用"英文好不好"打分,要用**能不能完成工作任务**打分。对照 JD,他需要用英文做的事只有这些:

| 任务 | 所需能力 | 权重 |
|---|---|---|
| 读懂英文需求、API 文档、报错日志 | 被动阅读 | 必须 |
| 写清楚缺陷描述、测试报告、技术文档 | 书面表达 | 必须 |
| 参加英文站会、说清阻塞点 | 短口头表达 | 必须 |
| 在电话/视频会里和海外开发争论一个缺陷 | 实时对抗性沟通 | **高** |
| 向海外业务方解释测试策略、说服对方 | 结构化口头表达 | 中 |

**最容易被低估的是第四项。** 很多人能做 presentation(提前准备过),但在被打断、被质疑、听不清对方口音的情况下会崩。而测试工程师的英文恰恰大量用在"我认为这是 bug,你认为不是"的场合。

### D.1 简历英文不作数

他的简历用词是 constraint-driven、lifecycle-aware、production-representative 这一级别的表达,句式复杂度很高。这在 2026 年几乎可以确定经过 AI 润色。

**验证方法(30 秒):**

> 挑简历上一句话,请他用自己的话重讲一遍。
>
> *"You wrote that you engineered a constraint-driven, lifecycle-aware test-data provisioning capability. Can you explain that to me in plain English, like you're explaining it to a new developer who just joined?"*

- **真会写的人**:能轻松降维,用简单词讲清楚,甚至比原句更清楚
- **AI 润色的人**:要么原样复述,要么卡住,要么降维后逻辑散掉

这题不带惩罚性 —— 简历用 AI 润色本身不是问题,但如果他口语和简历差距是两个量级,要如实记录。

### D.2 自然切换,不要宣布

**不要说** "Now let's switch to English to test your English."(制造考试焦虑,测出来的是应试能力)

**推荐做法:** 开场就说明这个岗位的英文使用场景,然后在 **Part 3 或 Part 5 的中段**自然切过去:

> *"By the way — our backend team and some of our stakeholders are offshore, so a lot of the day-to-day happens in English. Do you mind if we do the next part in English? Just so I get a sense of how it'd feel day to day."*

然后**全程不切回中文**,直到这一段结束。如果他中途切回中文,记录下来但不打断。

### D.3 三层测试(由易到难)

#### 第一层:技术叙述(3 分钟,热身)

> *"Walk me through the test automation framework you built at Saxo. What were the main components, and why did you design it that way?"*

这是他准备过的内容,主要看**流利度基线**和术语准确度。几乎所有候选人这一层都能过。不要在这里就下结论。

#### 第二层:即时解释与降维(5 分钟)

> *"Imagine I'm a business analyst with no technical background. Explain to me what a flaky test is, and why it's a problem for our release process."*

> *"One of our developers says automation is slowing the team down — the pipeline takes too long and half the failures are false alarms. In English, how would you respond to him?"*

**考察点:** 能不能在没有准备的情况下组织结构、切换语域(对技术人 vs 对业务人)。这一层开始有区分度。

#### 第三层:对抗性实时沟通(5-7 分钟,最关键)

这一层要**主动制造摩擦**。三个动作,任选两个:

**动作一 —— 打断他:**
在他讲到一半时插话:*"Sorry, let me stop you there — you said the regression takes about a week. Is that end-to-end, including the batch cycles, or just the automated suite?"*
→ 看他能否被打断后接住、准确回答、再回到主线。

**动作二 —— 反对他:**
> *"I disagree. I think 400 concurrent connections is way too low for a production-representative test. Our peak is much higher than that. Convince me your number was right."*
→ 看他在英文里能不能**坚持立场**。很多中国候选人英文一弱就自动退让,这会直接影响他未来在海外会议里的表现。这题同时是 **Courage** 的取证。

**动作三 —— 语速加快 + 用缩写:**
> *"So if the MR triggers the smoke suite and two of the E2E specs go red, but the API contract checks are all green — what's your first move, and who do you loop in?"*
→ 正常偏快语速,不刻意放慢。看他会不会主动说 "Sorry, could you repeat that?" —— **主动请求澄清是加分项,不是减分项**。不懂装懂点头才是红旗。

### D.4 书面英文(可选,5 分钟或作为带回作业)

如果这个岗位大量写英文缺陷单和报告,加一道:

> *给他一个场景,当场用英文写 6-8 行:*
> *"A trade amendment is not reflected in the position report after the daily batch. Write a defect ticket for the offshore dev team — title, steps to reproduce, expected vs actual, and impact."*

**考察点:** 不是语法,是**信息完整性和可执行性**。海外开发看到这张单子能不能直接动手复现,不用再来回三轮澄清。语法小错可以忽略,信息缺失不行。

### D.5 评分标准(按任务而非按语言学)

| 分数 | 表现 | 对应工作场景 |
|---|---|---|
| **5** | 被打断能接住;能反驳并说服;语域切换自如;主动澄清而非装懂。口音明显但完全不妨碍 | 能独立主持英文会议、直接和海外业务谈判 |
| **4** | 准备过的内容流畅;即兴略慢但完整;被反对时能坚持立场,表达稍简化 | 能参加所有英文会议并有效发言,偶尔需要跟进确认 |
| **3** | 能听懂、能答,但表达简化、被打断后需要重整;倾向于顺着对方说 | 日常站会没问题,但复杂争论会吃亏,需要有人 backup |
| **2** | 需要反复重复问题;答案明显短于中文时的答案;技术词会但连不成句 | 只能读写,会议基本听不进去 |
| **1** | 无法进行实时对话 | 不满足岗位要求 |

**给这个岗位的最低线:** 3 分可录用但需在 offer 里明确英文是发展项;**4 分是舒适线**;如果他未来要独立对接海外清算或业务团队,需要 4 分以上。

### D.6 需要特别注意的两点

**一、Saxo 那 3.5 年要验清楚。** Saxo 是丹麦公司,但他在中国区的团队。直接问:

> *"At Saxo, how much of your work was actually in English? Were your daily standups in English or Chinese? Who did you report to?"*

如果他的团队和直属上级都是中国人,那 3.5 年的"外企经历"含金量要打折。

**二、不要被口音误导。** 中式口音和英文能力是两件事。只看三件事:**听懂了没有、说清楚了没有、被质疑时立住了没有**。口音重但能吵赢的人,比口音标准但一被反对就退让的人,在这个岗位上强得多。

### D.7 记录栏

| 层级 | 具体表现 | 1-5 |
|---|---|---|
| 听力理解(含被打断、快语速) | | |
| 技术叙述流利度 | | |
| 即兴表达与语域切换 | | |
| 对抗性沟通中的立场保持 | | |
| 书面表达(如测试) | | |
| **综合** | | |

**Saxo 期间实际英文使用比例:**

**是否出现"简历英文 >> 口语英文"的断层:** ☐ 是 ☐ 否

---

## 附录 E — HKEX 清算 E2E 深度追问(英文,20 分钟)

> **一箭三雕:** 验业务深度 + 验"end-to-end"是否名副其实 + 英文实时表达。
> **执行方式:** 全英文,不切中文。准备好纸笔请他边说边画。**允许他画图 —— 画不出流程图的人,说明他没有全局视野。**

### E.0 开场锚定

> *"You wrote that you designed and delivered end-to-end validation across the post-trade clearing lifecycle. I'd like to go deep on that one.*
>
> ***Pick one concrete scenario — one instrument, one trade — and walk me through the entire lifecycle you validated. From the moment the trade is executed, all the way to settlement or delivery. Tell me what happens at each stage, and what you actually verified at each stage.***
>
> *Take your time. Feel free to draw it out. I'll interrupt with questions as you go."*

**给他 5-7 分钟不打断地讲。** 然后按下面的阶段逐段回挖。

**先记录一个基础判断 —— 他选了什么标的?**

| 选择 | 含义 |
|---|---|
| 具体到某个合约(如 HSI 期货某月合约、某 FX 期权) | 真做过,有手感 |
| 泛泛说"a futures contract" | 可能只做过局部 |
| 反问你想听哪种 | 好信号,说明不同产品他都熟 |

---

### E.1 阶段一:交易捕获与 Novation

> *"Let's start at the front. The trade is executed on the trading platform. How does it get into the clearing system? What's the mechanism — is it a message, a file, a batch?"*
>
> *"What exactly does novation mean here, and how did you verify that it actually happened correctly?"*

**追问:**
- *"What could go wrong at this step? Give me a real defect you found here."*
- *"How did you verify the trade in clearing matches the trade in the trading system? Field by field? Or just key fields?"*
- *"What about timing — if the trade arrives during a batch window, what happens?"*

**好答案的标志:** 能说清 novation 是 CCP 介入成为 buyer to seller / seller to buyer,对手方变成清算所;能说出验证点是原始交易属性 + 清算成员归属 + 账户映射。

---

### E.2 阶段二:持仓生命周期与交易后事件

> *"Now the trade is in. You mentioned amendments, give-up / take-up, and close-outs. **Pick give-up and walk me through it — what actually happens, who initiates it, and what did you validate?**"*

**这是高区分度的一题。** Give-up/take-up 涉及两个清算成员、双边确认、持仓在账户间转移、手续费和保证金归属变化。真做过的人能讲清双边动作和拒绝场景。

**追问链:**
- *"What happens if the receiving broker rejects the take-up? Where does the position sit in the meantime?"*
- *"How do you set up the test data for this? You need two participant accounts in the right state — how did you get them?"*
- *"Close-out — how did you verify the netting was correct? What if the client has both long and short positions in the same contract?"*

**关于 close-out 的关键点:** 净额 vs 总额持仓(net vs gross),不同账户类型规则不同。如果他能主动提到这个区别,是强信号。

---

### E.3 阶段三:每日清算与结算价(核心)

> *"Now we hit end of day. Walk me through the daily clearing run. What are the steps, and in what order?"*

**期待他能说出的序列:** 停止交易 → 结算价确定 → 按结算价重估持仓 → 计算当日盈亏(variation margin)→ 计算初始保证金 → 生成保证金通知 → 资金交收 → 生成成员报表。

**追问(这里是他简历上 Black-Scholes 那条的战场):**
- *"Where does the settlement price come from? Is it published by the exchange, or calculated?"*
- *"You said you generated deterministic settlement price inputs using Black-Scholes and cost-of-carry. **Why did you need to generate them at all — why not just use the real published prices?**"*
- *"How did you verify the system's calculated P&L was correct? What was your source of truth?"*

**关键追问 —— 测试预言机独立性:**
> *"Here's what I want to understand. If you calculate the expected value using Black-Scholes, and the system also calculates it using Black-Scholes — **how do you know you're not just reproducing the same mistake?** What if you both misread the same spec?"*

| 分数 | 表现 |
|---|---|
| 5 | 明确意识到这个问题;有独立验证手段(业务手工算的样本、监管公布值、跨版本回归比对、极端值边界推导) |
| 3 | 承认是个问题,但实际做法是"跟开发核对" |
| 1 | 完全没意识到,或反问"这有什么问题" |

---

### E.4 阶段四:保证金处理

> *"Let's talk margin. What margin model does the platform use? How did you test it?"*

**追问:**
- *"Initial margin versus variation margin — how did your test approach differ between the two?"*
- *"Margin calculation for a portfolio with offsetting positions — did you test the offset logic? How?"*
- *"If the margin requirement goes up and the client doesn't have enough collateral, what happens? Did you test the margin call flow?"*

**观察点:** 保证金是清算系统最复杂的部分。如果他只能讲"调接口看返回值",说明他做的是接口测试而不是清算测试。真做过的人会讲组合保证金、跨品种抵扣、以及"为什么我知道这个数是对的"。

---

### E.5 阶段五:交收与交割

> *"Final stage. Cash settlement versus physical delivery — did you validate both? Walk me through the physical delivery one, since it's harder."*

**追问:**
- *"Expiry and exercise — how did you test an option that expires in the money? What about at the money?"*
- *"Delivery requires the underlying to move. Did your test environment actually support that, or did you stub it?"* ← **这题在验"end-to-end"的真实边界**
- *"What's the last step where you can still say the whole lifecycle is correct? What did you assert at the very end — a database state? A report? A file sent to a downstream system?"*

---

### E.6 三道杀手锏(最高区分度)

**杀手锏一 —— 批处理与时间**

> *"Clearing is batch-driven. Your test scenario spans multiple batch cycles — end of day, then start of next day. **How long did one full end-to-end test take in wall-clock time?** And how did you make that repeatable?"*

**追问:** *"Did you manipulate the business date? How? If you roll the date forward, how do you roll it back so the next test run starts clean?"*

**这题几乎无法作假。** 跨日批处理的测试环境管理是清算测试最痛的地方。真做过的人会立刻讲业务日期推进、环境快照/还原、数据隔离策略,甚至会抱怨这件事有多难。答不上来说明他做的是单点接口验证。

**杀手锏二 —— 端到端的真实边界**

> *"You call it end-to-end. **What was the very first thing and the very last thing in your automated chain?** Was anything in the middle done manually, or stubbed out?"*

**打分逻辑:** 坦白说"某几段是手工的"或"下游我 mock 了"→ **加分**(诚实 + 知道边界)。坚称全链路 100% 自动 → **降分**并继续追问,清算全链路完全自动化极其罕见。

**杀手锏三 —— 失败归因**

> *"Your end-to-end scenario touches maybe eight or ten systems. When it fails at the last assertion, **how do you find out which system broke it?** Walk me through how you'd debug that."*

**期待听到:** 中间检查点(checkpoint assertions)、每阶段留证据、关联 ID 贯穿全链路、日志聚合。只答"看日志"是 2 分。

---

### E.7 E2E 专项评分

| 维度 | 观察点 | 1-5 |
|---|---|---|
| **链路完整性** | 能否讲出从成交到交割的完整序列,不跳段 | |
| **业务深度** | give-up、close-out、保证金、交割的机制是否真懂 | |
| **验证设计** | 每阶段验什么、为什么验这个、真值从哪来 | |
| **Oracle 独立性** | 是否意识到"用同一逻辑验证"的陷阱 | |
| **环境与数据** | 跨日批处理的可重复性怎么解决 | |
| **边界诚实度** | 是否坦白哪些是手工/stub 的 | |
| **失败归因** | 多系统链路的定位方法论 | |
| **英文实时表达** | 复杂业务能否讲清楚、被打断后能否接住 | |

---

### E.8 英文观察要点(与技术分分开记)

清算业务本身就复杂,用英文讲清楚难度更高。分开看两件事:

| 现象 | 判断 |
|---|---|
| 英文磕巴但业务逻辑清晰、术语准确 | **技术 5 分 / 英文 3 分** — 可录用,英文标注为发展项 |
| 英文流利但业务描述停留在表层 | **技术 2 分 / 英文 4 分** — 更危险,可能是背过的说辞 |
| 被打断后能接住、能主动澄清歧义 | 英文 +1,说明真在英文环境里工作过 |
| 遇到复杂概念主动切换更简单的表达重讲 | 强信号,这是真实工作能力 |
| 说不清时开始堆砌简历上的形容词 | 红旗,简历与实际有断层 |

**准备好的救场提示词**(他卡住时用,不要让他难堪):
- *"Take your time — draw it if that's easier."*
- *"Let me ask it differently. Just tell me what happens right after the trade is novated."*
- *"You can use the Chinese term if the English one doesn't come to mind, I'll follow."* ← 允许技术名词用中文,不影响英文打分,但能让他继续讲下去

---

### E.9 如果他讲得很泛(应对预案)

如果 E.0 讲完后你感觉全是抽象描述,**不要继续往下走流程**,直接切到具体事件:

> *"Let me try a different angle. **Tell me about the worst defect you found in this clearing flow.** What was it, how did you find it, and what would have happened if it had gone to production?"*

真做过的人讲这种事会突然变得具体、生动、有情绪。讲不出具体缺陷的人,基本可以判定他在这个项目里是执行角色,不是设计角色 —— 这直接影响 Senior 定级。
