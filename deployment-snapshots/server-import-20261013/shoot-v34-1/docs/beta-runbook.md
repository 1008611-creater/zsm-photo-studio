# 今晚推广前实站审查与修复（2026-10-09，当前v31）

- 结论：可先少量真实用户体验，尚不能宣称成熟无问题或承接无限推广流量。当前公网 `qjb-vibephoto-v31` / BUILD_ID `xo8WCzr0r5tPVVkEcUHNq`，ANS仍注册回跳版。两站health正常、worker在线，vibephoto空闲切换，原33份资产与全部旧任务保留，当前invocation错误0，前端chunk未包含渠道与OIDC secret，磁盘约14GB可用。
- 实际公网390px作品库/编辑/计划无横向溢出，视口内图片加载正常，桌面公开页正确v31。已有原图实际下载2272892字节，SHA256 `7c4e5e6d827e42f01b963aea382267cbf83f2db3b86cd565cc374e963cbb5595` 与服务端原图一致。匿名私有工程/图片404、gallery401、旧api410。根域与/studio都进入新版。本站保留noindex，不作为搜索收录上线承诺。
- 审查期间非审查agent发起的真实账号封面29秒成功保存并被用户认可；随后motion续拍出现 `OUTPUT_DIMENSIONS`，请求1024×1536但渠道返回不符，旧版没记录实际尺寸/保留返回图，无法补回。该失败仍保留、计次且未自动重试；后来又有用户自发成功任务，不能拿后续成功抹掉尺寸失败或宣称稳定。
- v31针对确定缺陷：可解码的尺寸不符返回图原字节保存在私有rejected-result资产，记录actual dimensions并向所有者提供下载；不改变像素、不计入成功作品、不允许成为认可母版、不加入参考数量、不被参考替换清理。成本记录补完整请求状态及用户能理解的错误。保存失败时明确记录失败原因并保留任务，不重复派发。此次是失败交付修复，未证明上游已能稳定执行尺寸。之前丢失的返回图不能恢复。新字段均添加式，schema/依赖不变。
- 为真实失败运行必要回归：本地和Linux13/13通过，类型/改动lint/runtime语法与Linux正式构建通过。只有离线字节和隔离数据库，无供应商请求或生产假作品。Windows初次测试因sandbox子进程EPERM未运行，获工具升权后正常通过；首次typecheck发现不存在assetUrl引用已改为现有asset helper，错误均保留。禁生成预览health/page就绪后发布。
- 推广容量：每账号10次，全站每日75张含派发失败；单worker串行，已有成功耗时约29～188秒，不能承诺高并发秒出图。用户可上传20张、单张8MB、上传全站128MB；照片私密保留30天，投稿需人工审核。10个IP图片rights登记全部pending，不能将来源存在/用户要求当作取得权利方商用许可；商用素材清权未完成。真实货币成本与支付、跨真人自主满意率、新邮箱收信/创建账号/登录带计划仍未完整新增验收。
- 自动审批拒绝了点击ANS登录：浏览器当前已有真实ANS账号，点击可能自动建本站session/领取赠送，此前专项确认仅覆盖本地隔离账号。未换工具绕过；已向用户合并询问允许使用当前“光”账号做生产登录（不上传/生图），等待回复。其他已授权开发、检查和部署完成。
- 回滚 `bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v31/rollback.sh` 回v30代码，保留DB/原图和新增rejected资产。schema兼容；若回v30，新增未验收图下载入口消失且旧版参考清理可能处理该角色，回滚前需核对。证据 `.scratch/promotion-audit/` 与服务器备份目录，最终review.json列明通过项与限制。本轮审查agent生图0、注册0、邮件0，不重启蔡宝测试。

---

# 注册返回 vibephoto 收尾（2026-10-09，已上线）

- 当前 vibephoto `qjb-vibephoto-v30` / BUILD_ID `zU5pImoN-yzzXyVIOijOA`，入口 https://zsm.cauai.fun/。ANS `ans-registration-return-20261009` / BUILD_ID `qEBUUzVAE0yDdDzdfNKkL`，镜像 `sha256:541d72080783694026b4d6b759a20770654eaf9ee39b94d2d37a3bfd134272b0`。下文旧版本均为历史。
- 修复已确认的新用户断点：ANS 登录页进入注册保留已校验的同源 callback；注册表单成功后回到带相同 callback 的登录页；注册页“已有账户”与注册关闭分支也保留回跳；OAuth 注册复用原 callback。vibephoto 作品库注册从本站发起一次性 OIDC flow，并在同一标签页进入注册，完成正常登录后回本站，不自动开拍。原玩法设置和私人参考仍只保存在本站。
- 等待登录/邮箱验证的 flow 与 HTTP-only Cookie 统一为30分钟；这不是延长授权码、ID token或登录会话。state/nonce/PKCE与一次性消费保持；授权码和身份签名验证未修改。同源回跳过滤另拒绝控制字符、反斜杠和登录/注册循环；外部callback被拒绝。公网有效 Referrer-Policy 为现有代理的 same-origin（抑制跨域来源）；应用仍设置no-referrer，保留首次检查预期不符的记录。
- ANS 构建前发现并发发布 `ans-real-projects-6a9c69f27d19e0f4`，部署守卫停止旧基线；比对五份认证源码、AGENTS、依赖锁与schema相同后基于新基线构建，保留新发布内容。首次构建被既有组件分层lint拦截，已移除客户端认证层导入、保留服务端校验；首次失败日志保留，第二次lint、正式构建、类型通过。构建使用无网络dummy数据库，既有静态路由数据库不可用日志不代表生产故障；正式生产数据库connected。
- vibephoto本地类型、lint和runtime语法通过，lint仅2条既有img警告；Linux正式构建及禁生成预览就绪后切换。ANS新镜像正式build/typecheck/lint通过。没有追加自动测试套件、合成生产作品、生产测试账号、验证码邮件或图像调用。实际公网浏览器已从新版注册入口到ANS注册，再点击登录/注册验证callback不丢失；未点击登录提交、注册提交或验证码发送，不把链接验收当真实注册成功。
- vibephoto发布前后12个projects、26个assets、16个jobs/attempts、赠送登记、账本、gallery、accounts的整表摘要保持，26份私有原文件hash保持，队列0。ANS用户11→11，60条迁移与完整运行环境不变；服务healthy。每ANS账号一次性10次和全站每日75次、原OpenLux高质量、作品保留30天沿用。
- 代码回滚：vibephoto `bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v30/rollback.sh` 回v29；ANS `bash /srv/ans-releases/ans-registration-return-20261009/rollback.sh` 回本轮修改前real-projects镜像（仍开放注册）。保留所有数据库和作品；两份脚本已检查，未实际切回。证据 `.scratch/registration-return/` 中两站deployment/verification、public-entry-check、原始源码与差异及public-register.jpg。真实邮件投递、新用户首次完整注册登录携带计划与首张满意作品本轮尚未新增验证。

下一阶段执行提示词：
> 基于当前v30与ANS注册回跳版，只修复真实推广用户从注册、保留玩法、上传本人参考到首张保存下载的实际阻断。保留每账号10次和全站75次、一次性PKCE、私密素材、全部失败、不自动重试与原渠道高质量，不重开蔡宝测试、不造作品或假账号、不扩页面素材；用用户真实反馈定位，沿现有可回滚部署交付，邮件或渠道问题报告实际错误与影响。

---

# ANS 开放邮箱注册（2026-10-09，已上线）

- 用户明确授权取消邀请码，让所有人创建账号。ANS已部署 `ans-open-registration-20261009` / BUILD_ID `wLcZQv_eg8cTFclTfAcbW`，公网 https://ans.cauai.fun/register 已移除邀请码字段和学校域名限制。邮箱格式、一次性邮箱验证码、10分钟有效期、发送冷却/尝试限流、Turnstile、密码强度/字节上限、邮箱唯一性和既有登录校验保留。旧客户端传inviteCode会被输入校验忽略，不查询/消耗邀请码；历史邀请码/核销数据保留。
- 以即时线上 `ans-product-3f040fbafe324d21`（Next16.3.8）为基础，未覆盖v27后已有ANS更新。只修改注册入口后端、注册表单、认证注释、相关翻译与旧回归预期。使用已有依赖和当前镜像，未新增服务、模型请求、邮件发送、真实人像上传、数据库迁移或凭据变更。
- 改动文件lint0错误/1条既有unused警告，正式构建及类型检查通过。遵循用户不追加测试的要求，没有跑自动测试套件或造测试账号；相关旧邀请码回归预期已改为开放注册但本轮未执行。生产实际页面确认5个输入项（昵称、邮箱、验证码、密码、确认密码）、无邀请码，显示所有邮箱可注册；人机验证组件正常加载。没有代用户发送注册邮件或完成新账号注册，邮箱实际投递未新增验收。
- 新镜像 `sha256:01329e5ce4dc9f6906550f40ff479b9bcdafda108b038e69a3ed06eab3eec07f`。数据库connected、注册配置可用，60条迁移历史完整且不变；环境变量逐值内存比较全部保持，线上用户数11→11。仅重建ANS app容器，无数据回退或子站部署。vibephoto仍v29，按账号一次性赠送10次与全站每日75次不变。
- 回滚 `bash /srv/ans-releases/ans-open-registration-20261009/rollback.sh` 恢复当前修改前ANS镜像与原Compose配置组合，不还原数据库、不清空账号；仅语法检查，未实际切回。该回滚恢复邀请码要求。服务器保留原镜像、source、manifest、构建记录与部署receipt；本地 `.scratch/ans-open-registration/deployment.json`、`build.json`、`manifest.json`、`public-register.jpg`。
- 此节解决下文v29所记的普通邮箱注册决策阻碍。现有付费/赠送额度边界、作品保留期限、渠道和注册邮件供应商不因此扩大；实际陌生用户首次注册与首次满意封面仍来自后续真实推广反馈。

---

# vibephoto 推广前收尾 v29（2026-10-09，当前公网）

- 已部署 `qjb-vibephoto-v29`，BUILD_ID `IofySe0tSCmWI9gBToGJG`，入口 https://zsm.cauai.fun/；现有跳转至 `/studio-next/studio`。本轮发布14份源码，依赖锁文件不变，源码与构建使用独立文件，共享不可变依赖；没有重新安装或修改共享node_modules。
- 无额度的新用户选择玩法后先进入ANS登录；所选完整设置保存于本站一次性登录flow，不把自由文字或私有参考交给ANS登录URL。认证成功后在账号下新建原玩法计划，直接返回准备页，没有派发生图。公开玩法链接使用配方作为React组件key，保证引入选择正确初始化。
- 已有匿名工程可明确点击“登录并继续此计划”，在账号下另存当前计划与四种当前参考，不迁移旧成片、任务、修改草稿、母版、失败记录或试拍授权。两处校验来源owner、保存revision、正在拍摄与待确认任务；参考复制校验原字节hash，并在同一SQLite事务中完成，失败回滚新增计划与文件。原工程保留；账号登录成功但复制失败时保留真实登录并说明找回原工程的方式。没有自动合并浏览器库。
- 登录到期显示重新登录入口并保留原账号工程返回地址，阻断过期页面继续提交操作。作品不存在提示明确包含账号归属，昵称fallback乱码修正为“ANS 用户”。日派发剩余额度按既有UTC账本只读计算；达到75次提前展示次日北京时间08:00恢复，保留个人次数，不更改派发计次规则。
- 按用户要求，本轮没有跑额外自动测试套件、插入合成生产作品、上传新人物、重新开始蔡宝质量测试或调用图像渠道。已做本地类型、改动文件lint、runtime语法检查和Linux正式构建；禁生成4197预览页面及health就绪后才切换。正式源码14份hash匹配。生产真实账号作品页面实际显示v29与10/10，上传入口正常；本轮没有新增上传/生成，不能把页面观察宣称为新增端到端真人质量验收。新登录携带计划与复制分支尚未用真实账号新增工程逐步操作。
- 切换前快照对照：projects/assets/jobs/attempts/shoot_access/account_gifts/access_charges/gallery八表完全不变，26份原文件hash一致，队列0、赠送登记仍1条，新增图片请求0。匿名私有工程404，异源登录准备POST403，公网health/数据库/worker与三个既有服务正常；根域实际到新版。原渠道OpenLux / gpt-image-2.5-sunburst-c / high保留。依赖去重后的根盘仍约14GiB可用。
- 发布时旧web进程正常终止返回143，systemd曾记一条旧进程退出失败。已为web添加SuccessExitStatus=143，并将两个unit名称更新为vibephoto production，不重启当前运行进程；当前两次invocation日志错误数0。保留原始recentErrorLines=1及原因，不能抹掉旧日志。未修改nginx、ANS运行规则或其他项目。
- 回滚 `bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v29/rollback.sh` 回v28代码/unit/配置，保留数据库和所有作品。添加式flow JSON新字段不影响旧表结构；没有schema迁移。证据 `.scratch/launch-v29/manifest.json`、`verification.json`、`public-account.jpg`，服务器同名备份目录包含正式构建记录、一致性SQLite快照、旧unit及运行配置。
- 仍需用户决策：ANS公网注册要求所有邮箱验证，非cau.edu.cn必须邀请码，会阻断无邀请码的推广用户。已合并询问是否允许所有完成验证码的邮箱注册，未收到答复前不更改ANS全站准入。每日全站75次、单账号赠送10次、上传20张/单张8MB/全站128MB、私密30天沿用；当前无支付，不宣称商业规模、人人满意或无限容量已验收。

下一阶段执行提示词：
> 以v29真实上线状态为基线，先处理已向用户提出的ANS普通邮箱注册准入决策，再把推广反馈集中在真实用户的首次开拍阻断。保持每账号一次性10次、全站每日75次、原渠道与高质量、不自动重试，蔡宝测试维持结束。不要新增虚构作品或占位投稿，不扩大页面和素材。依据用户真实操作反馈修复登录携带计划、参考准备、第一张成片保存/下载中确实发生的问题；保留所有原版与失败，通过本人认可判断满意度，不把返回200或构建通过当人物质量证据。修改继续沿现有备份和回滚部署，超出现有授权的资源与总请求额度先列明确缺口给用户。

---

# vibephoto 服务器磁盘优化（2026-10-09，当前仍为 v28）

- 此节更新下文优化前的磁盘限制；账号赠送与上传验收状态不因此改变。没有发布新应用版本，公网仍为`qjb-vibephoto-v28` / BUILD_ID `oEQ7LL9pigplQw8EnyFHA`。
- 系统盘使用率99%降至71%。可用空间由822763520字节（约0.82 GB）增至14857793536字节（约14.86 GB）；实际增加14035030016字节（约14.04 GB）。原因是历史release重复安装相同依赖，原release树约17GiB。
- 对历史`node_modules`逐文件比较相对路径、SHA-256、长度、权限及归属，只对相同文件用硬链接共享存储。533952次替换均复核内容hash及inode指向；当前运行版本文件未替换。29份release的源码、原构建、原依赖版本均保留，未删除版本、图片、失败记录、日志、其他项目、容器或全局缓存。
- 29份release以`zsm-shoot`用户验证Next16.3.7、sharp原生库、zod、fflate及原构建可读。当前web/worker PID仍2543294/2543295，维护未重启网站；公网health正常，原旧站服务仍active。v27构建及v28回滚脚本路径/语法通过，未实际切回演练。
- 只读对照维护前一致性SQLite备份：projects/assets/jobs/attempts/shoot_access/account_gifts/access_charges/gallery完全不变；trial与gift计数账本完全不变。26份私密原文件逐hash一致，16份已发布源码hash一致。新增模型调用0、购买资源0。
- 后续发布继续沿用当前部署方式共享不可变依赖，独立复制源码与`.next`。现有基准部署helper`.scratch/polish-v26/deploy.sh`增加package-lock一致检查并通过bash语法检查；lock变化时停止复用，须另建独立依赖安装，禁止直接在共享依赖上npm install/update或修改包文件。不要对所有release反复独立安装相同依赖。
- 运维前数据库一致性备份、unit快照、逐文件去重记录及完整验收在`/srv/hermes-data/vibephoto-ops/disk-20261009/`（目录0700、敏感快照0600，root-only）。依赖记录可无损压缩为`deduplicated.jsonl.gz`；本地脱敏证据`.scratch/disk-20261009/verification.json`。既有数据盘仍剩约51GiB，本轮仅存少量运维证据，未迁移业务数据、修改挂载或购买空间。

---

# vibephoto ANS 账号赠送开拍 v28（2026-10-09，当前公网）

- 已上线 `qjb-vibephoto-v28`，BUILD_ID `oEQ7LL9pigplQw8EnyFHA`，入口 https://zsm.cauai.fun/studio-next/studio；根域沿用现有新版跳转。未改ANS部署、签名私钥、原客户端、模型或渠道。
- 用户本轮明确授权每个注册账号赠送10次。首次通过真实ANS登录后自动领取，包含已注册账号；按稳定subject绑定，一次性发放，不随刷新、再次登录、换设备、删除项目或30天作品清理重置。不设运营到期日；服务数据库用9999年时间兼容原grant结构。`STUDIO_ACCOUNT_GIFT_ENABLED=true`只控制新发放，暂停拍摄仍使用现有生成总开关，个别授权可撤销。worker无需ANS客户端secret。
- 新增`account_gifts`唯一发放登记、`access_charges`逐任务逐镜扣次记录，均添加式。赠送授权允许账号自己的授权参考；旧蔡宝素材hash绑定授权保持不变。每张生成、续拍、单张修改各用1次；发送后失败/结果不确定仍计1，不自动重试。排队先预占，实际发送后不重复预占；未发送、每日硬限额拦截、排队取消不扣次。第11次阻断，同请求编号返回原任务。
- 保留全站每日75次派发硬上限（既有UTC计数），不扩付费资源。新作品/参考上传与排队任务共享空间校验；为排队/执行镜头预留最大20MiB结果空间，磁盘至少保留128MiB；空间不足在付费派发前阻断，已有作品仍可下载。gallery原全站128MiB、每账号20张/每张8MiB限制保留。
- Linux全量253/253测试（36文件）、typecheck、生产构建、禁生成隔离预览通过后切换。本地typecheck通过，lint0错误/2条既有img警告。新增测试验证跨进程同时首登仅发1份、账号隔离与恢复码防转移、跨项目预占/重复提交、失败扣次与第11次阻断、删项目/重开数据库不能重领、每日上限/空间不足/取消不扣、撤销不重发。
- 公网浏览器通过真实已有ANS会话完成登录回站，账号菜单与私有库正确，显示10/10。实际退出恢复原浏览器作品/75次；重新ANS登录后仍10/10，数据库仅一份gift。390×844手机视口页面无横向溢出，上传入口可见；非真实物理手机验收。截图`.scratch/public-v28/public-account.png`及`public-account-mobile.png`。
- 公网合成文件上传被浏览器安全审批拒绝，未绕过、未上传；用户的具体公网私密合成夹具验证许可问题已提出、待答复。原v27本地上传/保存/原图下载验证继续适用，不能当作本轮生产上传已通过。本轮没有调用图片模型、未重启蔡宝测试、未新增公开投稿。
- 公网只读核验：16份发布源码hash匹配，原3工程13张图片hash及全部jobs/失败记录不变；旧used25/100、remaining75。新gift total10/used0/reserved0/remaining10；queued0、submissions0；匿名0次、原私有项目404。模型仍OpenLux / gpt-image-2.5-sunburst-c / high，密钥root-only且前端静态包不含凭据。服务active、近5分钟错误日志无新增。
- 回滚`bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v28/rollback.sh`回v27，保留数据库、作品和赠送台账；v27暂不支持新账号赠送开拍，回切前先检查排队。脚本语法及目标已核对，未实切演练。证据`.scratch/public-v28/manifest.json`、`verification.json`与服务器同版本备份目录。
- 生产磁盘剩744388KiB（约727MiB），可小范围开放，不能宣称已具备大规模容量。未购买资源、未删除旧release/其他项目。实际货币单价仍未知，本轮新增模型成本0；每账号赠送并不代表10张满意作品，跨人物自主满意率未新增验证。

下一阶段执行提示词：
> 以v28线上真实账号和10次独立赠送为基线，先完成已获具体许可的生产私密合成图上传与字节一致下载验证，再让首批真实用户在自己的授权参考上独立完成封面。记录10次额度内获得认可封面的实际次数、失败原因与全部模型请求；不自动重试，不重启蔡宝测试，不扩页面/角色/地点。先解决现有磁盘容量约束和匿名选玩法后登录的工程延续问题，再决定是否扩大每日75次派发上限。未经授权不购买空间、不删除历史作品或旧部署。每次变更继续核验账号隔离、一次性赠送、旧试拍75次和原13张作品不变，并沿现有回滚部署交付。

---

# vibephoto ANS 账号与作品上传 v27（2026-10-09）

- 公网版本 `qjb-vibephoto-v27`，BUILD_ID `JXY4XwTracX0Ckz7XWrZB`，入口 https://zsm.cauai.fun/studio-next/studio 。账号入口与作品上传已发布。真实账号的生产浏览器登录仍等待用户具体授权验收，不能将隔离测试账号登录称为真实 ANS 登录成功；普通账号没有自动开拍额度。
- ANS 新增独立 OIDC 客户端 `vibephoto-prod-20261009`，精确回调 `https://zsm.cauai.fun/studio-next/api/shoot/auth/callback`。复用原 ANS 账号、Authorization Code + S256 PKCE、RS256 签名键；原 Toonflow 客户端/环境值不变。本站校验 state、一次性 flow、nonce、issuer、audience、签名、有效期及 userinfo subject。只接收账号标识与昵称，不接收邮箱/角色，不持久保存 access/id token。
- ANS 发布 `ans-vibephoto-oidc-v27`，镜像 `sha256:be18b33201c0885f124e195b16e7308ffc3b26ab34e6075d08a8fc4381bb78aa`，BUILD_ID `0sqPahZuUDgE3ev8p0CwM`。原镜像和生产配置保存在 `/srv/ans-releases/ans-vibephoto-oidc-v27/runtime-private/` 与独立 rollback.sh。没有 schema 修改；原入口迁移命令沿用现网流程，本轮没有新增迁移文件。
- 账号和授权流程存 SQLite；本站独立登录2小时，退出本站不退出 ANS，退出 ANS也不会即时撤销本站已经发出的2小时会话。重新登录稳定对应同一作品所有者。原浏览器拍摄不自动转移账号，账号登录不会承接蔡宝试拍额度；退出账号后原浏览器工程仍可查看。旧匿名恢复码不能恢复账号作品。
- 上传仅进入本站私密存储，不发送图像模型。支持经过实际解码校验的静态 JPG/PNG/WebP，128像素起、单图8MB、每账号20张，30天自上传起保留；原字节和元数据不修改。站点上传作品初始总容量128MB，磁盘余量不足128MB即停止新上传，上传消耗同时计入已有总存储上限；没有购买新存储。服务器发布后余约868MB，开放范围应按实际空间控制，不宣称无限保存。
- 上传请求带稳定 UUID；相同账号同一请求同一原图返回原记录，改图或改标题复用该请求编号返回冲突。网络不确定时先同步列表，不自动再次上传。私有图、原图下载、删除和投稿都按账号隔离；同源请求保护、解码/文件大小限制、全站及账号限流已启用。
- 投稿需另行确认公开展示和人物许可，先为 pending，未经审核不进入公共列表/图片接口；发布后显示“用户上传”，不伪装模型生成。公开下载包含原始元数据，确认区已说明。撤回立即取消服务器公开访问，不能收回第三方此前已下载的副本。账户作品与投稿随保留期清理。
- 运营审核沿用现有服务器，不新增后台：在正确运行目录设置 STUDIO_DATA_DIR 后运行 `node scripts/review-gallery.mjs list` 查看待审 UUID；取得并审阅真实原图及权利范围后，`node scripts/review-gallery.mjs approve UUID --confirmed-review`，拒绝用 reject 与原因。不能仅看标题就审核通过，也不能为制造空墙内容自动发布测试图。SQLite gallery JSON 的 file 对应私有 assets 原文件，仅服务端管理员可读取；不得放到公共静态目录。
- 本地245/245测试、typecheck、lint通过；Linux相同245测试、typecheck、正式构建通过。ANS原9项+新增13项HTTP协议测试通过，隔离空数据库预览验证登录页面、discovery/JWKS、新旧客户端登录跳转及正确client-secret鉴权。ZSM复制库禁止生成的4197预览通过实际ANS注册跳转、假回调拒绝、匿名上传401和旧生成接口410。
- 用户具体授权后，用 localhost:4208 的“本地验证账号”通过测试 cookie 验证界面登录、既有纯色夹具上传、刷新恢复、投稿确认及浏览器原图下载。下载 SHA256 `3ceaac91518189b74d52d4e94da5f435457d6a1c38b6175bca4e525f14d36fee` 与原夹具一致。该测试没有真实人物、生产数据库或模型调用，测试登录不能充当线上真实 SSO 证据。手机视口验证无横向溢出；公网账号入口和更新后的归属说明已实际检查。通过正常退出按钮清除了测试会话，临时视口已恢复。
- 公网原3个生成工程共13张原图、全部任务和失败、六镜ZIP13651455字节保持；原账号前的浏览器额度 used25/100、剩75、queued0、submissions0、grant1。OpenLux / gpt-image-2.5-sunburst-c / high / 1024x1536 不变。新普通账号无任何grant，不能消费该运营key。新增生图请求0，没有真实人像上传。
- 密钥由ANS内存经SSH stdin转移至root-only `/etc/zsm-photo-shoot/ans.env`，只web加载；未写本地、源码、前端或报告。ANS原签名私钥留在ANS。公网静态资源检查未包含OpenLux或客户端secret。回调专用nginx location关闭access log，登录响应no-store/no-referrer。
- ZSM回滚 `bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v27/rollback.sh`，回v26并保留数据库及全部原图；账号与上传表为添加式，旧版忽略。回滚后新增账号/上传入口暂不可用，数据仍保留。ANS独立回滚 `bash /srv/ans-releases/ans-vibephoto-oidc-v27/rollback.sh`，恢复原镜像与原配置，既有Toonflow不受本站关闭影响。两份回滚语法/目标已核对，未实际切回。
- 证据 `.scratch/public-v27/manifest.json`、`verification.json`、`ans-deployment.json`、`ans-preview.json`、`public-mobile.png`。ANS公网新旧客户端分别通过正确凭据认证并对不存在的授权码返回invalid_grant；authorize无真实会话跳转原登录页，登录/注册/discovery/JWKS/health均200。这仍不是完成真实账号登录的证据。注册仍遵守ANS既有邮箱/邀请码与验证码条件；支付、所有人自助真实生成、第三方渠道价格和跨用户真实满意率未验收。

下一阶段执行提示词：
> 基于v27真实上线证据，先在用户授权的ANS账号上完成完整生产登录与上传/原图下载验收；测试作品默认私密，不能自动公开。再按用户明确给出的公共试用总请求上限、单账号上限及素材授权，建立独立于蔡宝试拍的按账号受控开拍范围。先一张封面，再由本人认可后逐镜续拍，所有失败计次数、不自动重试，保留参考原件、请求与结果记录。优先打通普通用户从登录、自己上传参考到保存满意作品的路径；先用合成数据验证额度隔离、并发、重复提交和撤销，实际费用未知就记录未知，不能编造人民币成本或把旧75次拆给新用户。扩量前解决现有磁盘容量约束并给出可回滚的部署。

---

# vibephoto 单张修改可靠性 v26（2026-10-09，当前公网）

- 已上线 `qjb-vibephoto-v26`，BUILD_ID `BNtW5yaVwG8o3sOhyH6r3`，地址沿用 https://zsm.cauai.fun/studio-next/studio。发布9份源码；已检查实际改动，保护其他本地未提交内容。
- 单张修改文字按工程与原片版本私密保存在现有SQLite项目数据中。停输入650ms及离开输入框时保存，显示待保存/保存中/已保存；刷新后恢复。有草稿的折叠修改区显示标记。没有使用前端存储冒充生产数据库，也没有新增基础设施或schema迁移。
- 草稿有独立版本，不变更拍摄计划revision、认可母版或原图。清空保留版本记录，防止旧窗口复活已删除文字；相同文字的重复请求确认原记录。项目删除及30天保留期限同时覆盖草稿，其他会话不能读取或修改。
- 两窗口修改同一原片时展示本窗口与已保存文字，用户选择采用或保留后再保存。不同原片/版本/工程互不串用；保存过程中继续输入不会被旧回复覆盖；切回窗口只读同步。网络失败先读取核对是否已经保存，不自动再次写入；用户可手动保存，尚未保存离开页面有浏览器提醒。已保存文字不等于已经发送图片请求。
- 图片修改提交前确认文字已保存；拍摄任务已接收后只清理相同原片的对应文字，不删除之后输入的新内容。原有授权范围、扣费确认、失败保留和不自动重试规则沿用。历史版本选择增加明确无障碍名称。
- 本地与Linux225/225测试（33文件）、typecheck通过，lint0错误/2条既有img警告。Windows webpack与Linux生产构建通过；4197禁生成预览通过后切换。本地禁生成合成工程实际验证刷新恢复、两窗口冲突对比/保留、断网失败/手动恢复、历史版本隔离；纯色夹具标为工程验收，未上传生产。
- 公网页面实际v26，修改区显示保存状态；390×844视口无横向溢出，图片全部加载，无文字时生成禁用。临时网络/视口设置已清除，本地测试页及4207预览停止。浏览器视口验证没有冒充物理手机或陌生用户实测。
- 公网草稿接口使用原内容作幂等确认，未更改生产项目；其他会话返回404。9份源码hash匹配清单；原3工程13张作品hash、project数据及全部jobs/失败记录与切换前一致。六张ZIP13651455字节逐图hash匹配；used25/100，remaining75，queued0、submissions0、授权1条，新增图片调用0。服务active、最近错误日志无新增，密钥root-only且前端静态包不含密钥。
- 回滚：`bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v26/rollback.sh`，恢复v25代码与配置，不覆盖数据库、原图、草稿或额度。脚本语法通过，未实际切回演练。快照、测试和验证证据在同目录；本地 `.scratch/polish-v26/verification.json`、`ui-verification.json`、`manifest.json`、`public-draft-state.png`。
- 限制：断网且最后一次文字未保存时，刷新仍可能丢失该次输入，页面明确提醒；准备页的计划调整仍须保存，尚未做计划自动保存。真实单张修改精度、跨人物满意率、实际货币成本与支付没有新增验收。蔡宝测试保持结束。
- 下一阶段执行提示词：基于v26，优先让准备页的计划调整也能可靠保存与恢复，复用现有计划版本和冲突合并，不让保存操作绕过开拍校验。使用隔离合成工程验证快速输入、刷新、切工程、两窗口、网络回复丢失和待确认请求；界面只展示必要的保存状态与明确下一步。不要新增页面/角色/地点，不重新开始蔡宝生图测试，不消耗剩余额度。通过相关回归、桌面/手机实际操作和隔离预览后沿现有部署更新公网，保留原片、失败记录与可回滚版本。

---

# vibephoto 体验细节打磨 v25（2026-10-09，当前公网）

- 已部署 `qjb-vibephoto-v25`，BUILD_ID `LxWFFSJ0ccpBQWiW3m4IJ`。本轮修复实际操作中的引导、焦点、状态串页与过度展开，没有扩页面、角色或地点，没有重新开始蔡宝真人测试。
- 作品页默认收起“调整这一张”，保留原图保存与审片主动作。审片主按钮原先受review样式覆盖，已恢复蓝底及清晰禁用态。母版长说明移到按需帮助，计划页删除重复封面确认按钮，空结果页首次开拍不再称为重试；固定要素读取实际settings.locked，历史计划标题和进度读取对应计划。
- 六镜交付后，小恐龙优先引导审片与下载，不再被已保存的历史不确定请求带去查账；新的失败或待确认仍优先处理。查询账单仍指向生成记录，历史失败全部保留，新增请求的明确扣费确认仍强制。
- 新用户缺参考时先提示准备参考；准备好仍须对应授权。授权说明明确额度绑定原人物/角色/地点，可用恢复码找回原拍摄，保存/上传不会自动获授权。旧prepared暴露原revision供页面提前禁用并解释，放弃仍由用户决定。首页与作品库不再显示React保留工程的pending/草稿冲突提醒。
- 工程切换重置选中镜头及相关临时状态；作品墙打开照片先读取最新工程。每张照片的修改草稿在本窗口分别保留，切换再返回不会串用或直接丢失；刷新仍会丢失未提交的照片修改文字，未将其伪装为持久化记录。逐镜计划草稿合并新增shotNotes子字段，保留别的窗口改动和显式删除。初次bootstrap失败后同步能重建原URL工程，不再卡在首页。
- 恢复码界面优先找回，空作品库不提供无意义的新码生成；更换前内联确认旧码立即失效。网络回复不确定给出同步入口，不自动再请求。帮助图标支持Enter展开、Esc关闭、点击外部关闭，手机触控目标扩大；大图切镜/版本重置对比状态，返回修改展开并聚焦输入。小恐龙在准备页上移，避免遮挡手机下一步按钮。
- 本地及Linux211/211测试（31文件）、typecheck通过；本地lint0错误/2条既有img警告；生产构建、4197禁生成隔离预览通过后切换。21个发布文件hash与本地清单匹配。新增回归验证不同镜头合并、完成组照+历史不确定引导、新失败优先、费用导航、输入与授权顺序，以及待确认的版本/未保存/授权/未知readiness禁用原因。
- 隔离本地合成库浏览器验收：使用已有纯色工程测试图，标题标注非生成；覆盖修改区默认收起、大图返回焦点、按照片保留修改输入、跨工程返回封面、旧请求说明/禁用及库页不串提示、首读失败后同步找回组六镜、恢复码更换的确认/撤回。未自动生成恢复码或模型请求，合成数据未上传生产。
- 手机390×844布局document宽390；DOM实测下一步按钮top778/bottom824，小恐龙top596/bottom702，无相交。按需帮助Enter展开/Esc关闭通过。这里是浏览器视口验收，没有冒充真实物理手机测试或陌生用户自主测试。
- 公网实际v25：桌面修改区默认折叠，小恐龙显示组六镜审片/下载引导；填快捷修改而未勾扣费确认时生成按钮禁用，本轮未发送。手机等待资产加载后所有图片正常解码、document宽390，所有临时网络与视口设置已清除，保留用户原组六镜页。
- 公网只读验证原3工程13张成片hash、project内容及全部jobs/失败记录与上线前快照一致；六张ZIP13651455字节，逐图hash匹配；原会话剩75、used25/100、queued0、submissions0、授权1条、图片请求新增0。陌生会话无额度，原私有工程404；渠道仍OpenLux / gpt-image-2.5-sunburst-c / high / 1024x1536，前端无密钥。web/worker/旧站均active、错误日志无新增。
- 回滚 `bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v25/rollback.sh` 回v24b，保留所有数据库、原图及额度，不做数据回退。旧配置与SQLite一致性快照、测试/类型记录在同目录；回滚仅语法核验，未实际切回演练。服务器剩约1.2GB；未删除不明release，未新增基础设施。
- 证据 `.scratch/polish-v25/manifest.json`、`verification.json`、`ui-verification.json`、`public-guide.png`、`public-results.png`、`public-mobile-results.png`、`local-mobile-edit.png`；本轮前置备份 `.scratch/polish-v25-before/`。仍未验证跨人物自主满意率、单张真实修改精度、真实账单金额与支付；不宣称完美或商业全开放。

下一阶段执行提示词：
> 基于v25真实代码和polish-v25证据，继续消除完整拍摄中可复现的操作断点。优先核查未保存修改离开/刷新、照片加载失败与下载失败、跨设备恢复和真实用户可理解的授权边界；只修有证据的问题。保持作品与失败完整、原渠道/高质量和剩75次授权，蔡宝测试继续结束，不主动生图，不扩页面或素材。所有无费用流程先用隔离数据浏览器复现并修复，补必要回归并上线。需要跨人物验证时仅收集具体素材与对应授权，不自动开放运营key；真实用户的独立操作时间与阻断位置要实际记录，不编造用户或成功率。验收区分工程、操作与画面质量，提供实际公网版本、原数据不变证据及回滚。

---

# vibephoto 待确认请求版本锁定补丁 v24b（2026-10-09，当前公网）

- 当前版本 `qjb-vibephoto-v24b`，BUILD_ID `aJFmVIK5Kzh79fNxAOPbD`。v24基础恢复与草稿功能见下一节；兼容旧jobs接口新增prepared原始revision检查，不允许将旧请求编号重新绑定到新计划。同号已入队仍返回原job，未入队的旧版请求须明确放弃并重新准备。
- 新增回归用例证明：准备后另一窗口修改计划，即使旧jobs接口携带新revision，也返回409/SUBMISSION_CHANGED；jobs仍0，原pending保留。相关14/14本地测试、typecheck及lint通过（0错误/2条既有img警告）；Linux全量202/202（30文件）、typecheck、构建、隔离预览均通过，才切换公网。
- 公网只读复核同v24：原13张作品及全部项目/jobs/失败记录未变，六张ZIP13651455字节逐张hash匹配；原会话75剩余额度、used25/100、queued0、submissions0、授权1条、本轮模型调用0。陌生会话无额度且私有工程404，原会话开拍能力正常；渠道/模型/质量不变，前端无密钥。日志无新增错误，原旧站与web/worker均active。
- 证据 `.scratch/resilience-v24b/manifest.json`、`verification.json`、`public-results.png`；v24的本地恢复、断网和移动验收证据继续适用，v24b仅补服务器版本锁定。最终公网手机document宽390、全部图片加载，实际页脚v24b；临时viewport覆盖已清除。
- 回滚 `bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v24b/rollback.sh` 回v24，保留数据库/作品/额度；如需要继续回v23，须先检查pending与下节限制。仅语法验证，未实际回滚演练。服务器余约1.3GB，未删除不明release。未新增生图或跨人物授权，商业金额/支付与跨用户满意率仍未验证。
- 下一阶段唯一瓶颈、执行提示词沿用下节：独立用户能否理解授权和参考要求并到达第一张可信封面。执行时以v24b现行代码为准，不重启蔡宝测试、不主动派发、不扩素材。

---

# vibephoto 弱网提交恢复与多窗口计划保护 v24（2026-10-09）

- 已部署 `qjb-vibephoto-v24`，BUILD_ID `ZQTVktLfhnIKOXO4UT5E7`。公网 `/studio-next/studio` 实际页脚显示本次版本；根域和旧 `/studio` 保持302到新版。web/worker/旧站均active，最近错误日志无新增。
- 拍摄改为持久化准备请求后明确确认入队。准备不排队、不计费、不预留额度；回复不确定时停止提交链路，同步只查询。同一请求重复确认返回原任务；刷新可找回待确认请求；明确放弃阻断迟到确认，不能取消已入队请求或上游计费。保留所有原作品、失败和历史版本，无自动重试。
- 未保存草稿有服务器基线；另一窗口更新时保留当前输入，禁止旧版覆盖。用户可采用最新计划，或显式合入本窗口改过的字段，其他字段保留服务器最新值。本轮合并粒度为顶层字段；`shotNotes`整体作为一个字段，逐镜同时编辑的精细合并尚未实现。
- 本地和Linux均201/201测试（30文件）、typecheck通过；本地lint0错误/2条既有img警告；Linux生产构建和4197隔离预览通过后才切换。新增测试覆盖重启恢复、丢失确认响应、去重、迟到确认、访问隔离、旧计划与不可变请求，以及网络失败只发一次fetch、字段合并。
- 本地隔离合成库浏览器验收：prepared刷新恢复，生成关闭时确认禁用，放弃后提示消失且jobs=0；旧窗口保存触发冲突并保留输入，显式合并同时保留本地名称和远程新增想法；断网同步错误获得焦点，恢复联网后仍找到原请求；390px手机页面宽390无溢出。合成夹具仅在本地，未上传生产或冒充真实生成。
- 公网只读验证：原3个关键工程13张原图hash、project数据与全部jobs/失败记录同上线前一致；六镜ZIP响应13651455字节，6张图逐字节匹配原图。陌生会话无额度且私有工程404，原会话enabled=true、remaining=75，wrong-source及other-owner均阻断。used=25/100、queued=0、submissions=0、授权记录1条，本轮图片模型请求0。完整渠道仍OpenLux / gpt-image-2.5-sunburst-c / high / 1024x1536；前端静态包无密钥。
- 公网桌面和390×844手机原六镜页图片均正常解码，页面实际v24，手机document宽390；截图及脱敏证据位于 `.scratch/resilience-v24/`。所有临时浏览器网络/viewport覆盖已清除，保留用户原组六镜页。未对生产插入合成pending，未重启已结束蔡宝真人测试。
- 迁移仅新增`submissions`表，项目删除随FK清理；旧v23可忽略此表。备份 `/var/backups/zsm-photo-shoot/qjb-vibephoto-v24/` 保留旧unit、运行配置、一致性SQLite快照、测试及验证记录。代码回滚：`bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v24/rollback.sh`，回到v23、不覆盖用户数据库、不重置额度；旧v23界面不能呈现v24待确认请求，回滚前需检查pending并受控处理。脚本语法通过，未实际切回演练。服务器余1.5GB，没有删除不明release或新增基础设施。
- 仍未验证：跨用户自主获得满意作品、真实单张修改精度、真实账单金额和支付；不把工程通过当作商业全上线。真实费用仍null而非0。本轮没有新增图片调用，剩余75次授权保持原人物/角色/地点范围。

下一阶段执行提示词：
> 读取v24现行代码、本节及resilience-v24证据，集中解决「陌生用户如何独立到达第一张可信封面」的最大瓶颈。保持蔡宝测试结束、原13张作品与失败记录、原渠道/模型/高质量及剩余额度，不主动派发模型请求、不扩页面/IP/地点。先用隔离合成数据让未获开拍授权的新会话走完准备、计划、阻断解释、恢复、审片和下载；修复用户不经口头指导无法判断下一步的断点，主操作清楚，次要说明按需展开。收集真实独立操作中的阻断位置和完成时间，不能虚构受测用户或成功率。跨人物真实验证须有具体素材与对应额度授权，沿用封面认可后逐镜流程，保留所有失败、每个原版及请求成本依据，不自动重试。上线前复核访问隔离、重复提交、弱网恢复和回滚，报告公网版本、证据与尚未验证条件；支付和定价等账单及商户条件确认后再接入。

---

# vibephoto 自助开拍条件与恢复补齐 v23（2026-10-09）

- 已部署 `qjb-vibephoto-v23`，BUILD_ID `zWf8SO1PoMH7zOWw6drJK`。根域 `/`、旧 `/studio` 均302到新版；公网浏览器真实显示v23，两个服务与旧站均active，近期error日志无新增记录。沿用已授权OpenLux / gpt-image-2.5-sunburst-c / high / 1024x1536，两个EnvironmentFile分别保留运行配置与root-only秘密，不改供应商、额度或原图。
- 新增只读项目开拍检查，bootstrap与所有项目JSON响应都携带当前保存计划的检查结果；授权参考范围、素材缺失、文件存在、画幅、服务状态、队列占用与额度采用实际服务器状态。检查不预留额度、不持久化到工程、不调用模型，任务入队与worker派发仍独立核验。66份上线源码/类型/测试配套文件hash与本地清单匹配。
- 准备页、计划页与修改按钮旁提前提示阻断，次要原因折叠，提供准备参考／调整画幅／查看作品／同步等入口。会话有额度不再被当作任何新计划都能开拍。原拍摄检查通过；原会话另3个缺参考或不匹配工程提前拦截。OpenLux未开放横幅与方幅按钮禁用；已有历史画幅与下载保留。小恐龙读取同一项目开拍状态。
- 计划页新增上次请求/扣费不确定时的显式确认；结果页把确认放到修改按钮前。换项目时清除确认状态，不代核实账单、不自动重试。整组进度显示已保存6/6，最近单镜任务状态移到按需说明，避免1/1被误读为整组进度。
- 本地与Linux均188/188工程测试通过，typecheck通过；本地lint0错误/2条既有img警告。发布前旧包缺少原生导演台测试依赖及操作员脚本类型声明，已补齐固定本地文件后才完成Linux检查、生产构建和隔离预览，未下载或安装新依赖。原release节点依赖仅复用不可变硬链接；源码单独复制。
- 公网检查原工程、13张成片hash及所有jobs/失败记录与发布前SQLite一致性快照相同；账本25/100、剩75、队列0、本轮图片模型调用0。陌生会话enabled=false/remaining=0，原项目404。修改快捷输入未勾扣费确认时生成按钮仍禁用，未提交请求。公网ZIP实际响应13651455字节，六张PNG解包hash与原图逐字节一致。
- 公网390×844手机作品页及未匹配参考的准备页document宽390，无横向页面溢出；原图均解码1024×1536。桌面与手机检查后已清除临时视口设置、恢复原六镜作品页。本地合成故障演练验证计划页有扣费确认且未授权开拍禁用；仅隔离本地测试库添加合成失败记录，未进入生产或展示为真实生图。
- 备份 `/var/backups/zsm-photo-shoot/qjb-vibephoto-v23/`，包含旧unit、旧运行配置、SQLite一致性快照、验证及测试日志。代码回滚：`bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v23/rollback.sh`，回到v22服务配置，不覆盖用户数据库、不重置额度。关闭当前受控开拍：`bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v23/disable.sh`，先确认无活动任务，再撤销蔡宝授权并关生成开关；凭据继续保留在root-only秘密存储以支持配置回滚，不删除作品。不在v23直接使用下方历史v22关闭脚本。两个脚本均通过语法检查，未实际执行回退/关闭演练。
- 本地证据 `.scratch/selfserve-v23/manifest.json`、`verification.json`、`public-results.png`、`public-mobile-results.png`、`public-scope-check.png`、`public-mobile-scope.png`与本地合成计划恢复截图；发布前改动文件备份 `.scratch/selfserve-v23-before/`。当前服务器磁盘余约1.6GB，未删除其他release或项目。
- 仍未验证：陌生用户跨人物/地点自主得到满意成片、单张修改精度、真实账单金额及支付。现有原会话受控额度不授权其他用户或新素材；蔡宝测试保持结束。工程检查、历史用户认可与商业开放分别报告。

下一阶段执行提示词：
> 读取v23现行代码与本节证据，继续把已认可拍摄配方变成可独立完成的创作过程。最高优先级是消除“页面说下一步可拍，但实际授权、参考或任务状态不允许”的最后断点。沿用已授权原图、OpenLux完整Sunburst-c、高质量和原账本，保持蔡宝测试结束，不主动派发模型请求。先在隔离测试库覆盖慢网络、提交响应丢失、双窗口更新、未保存修改、错误恢复和跨设备恢复，检查是否能清楚找回同一任务与全部原版；发现阻断就实现修复、验证并沿用现有部署。不要扩页面/IP/地点，不开放运营key给陌生人；跨用户真人复现需要具体素材和额度授权，账单确认后再设计收费。保留失败，禁止自动重试与静默换渠道。交付必须有公网版本、完整链路证据及不覆盖用户数据库的回滚路径。

---

# vibephoto 公网受控开拍已启用 v22（2026-10-09）

- 用户明确回复“允许，继续”，授权本机独立OpenLux凭据保存到现有服务器受限秘密存储，并仅给原私有会话、蔡宝／奶蛙／外滩原图启用剩余75次。已完成配置及授权登记；下方v22“仍有具体阻碍”是启用前历史状态，不再代表当前配置。
- 公网版本仍为 `qjb-vibephoto-v22`，BUILD_ID `A8-ZEIax3mbuzWCLGgWSf`；本轮没有修改产品源码或重新构建。当前公网页面实显“受控开拍 · 剩余75次”。正式渠道显式使用 `OpenLux / gpt-image-2.5-sunburst-c / high / 1024x1536`，默认McGrox与全局文本模型配置未修改，不自动切渠道。
- 秘密位于 `/etc/zsm-photo-shoot/openlux.env`，root/0600、目录0700，仅两个现有服务读取；凭据未进入前端静态包。只读GET模型列表返回200且完整模型ID存在，这不等于本轮重新验证图片生成或质量。数据库ok/schema2、worker online、开拍开关已启用。
- 仅1条原会话授权；授权会话bootstrap enabled=true/remaining=75，陌生会话enabled=false/remaining=0且原项目404。错误原始素材与其他owner均被阻断。三个关键工程的13张原图hash、任务与失败记录同启用前快照一致；used仍25/100、queued=0、新增图片调用0、不自动重试。已结束真人测试继续保持结束，由用户手动发起后续拍摄。
- 启用前unit、运行配置及一致性SQLite快照位于 `/var/backups/zsm-photo-shoot/qjb-vibephoto-v22-openlux-20261009/`。关闭本次开拍：`bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v22-openlux-20261009/disable.sh`，撤销授权、恢复服务配置、移除本次秘密文件，不覆盖数据库、不退回已消费额度、不删除作品。脚本已检查，未实际执行演练。若回退v22代码，先关闭本次开拍，再运行原代码rollback脚本。
- 脱敏证据：`.scratch/activation-v22/activation.json`、`verification.json`、`public-enabled.png`。工程验证沿用上一轮181/181通过，本轮另完成生产配置、访问隔离、素材范围、凭据未入静态包及原图不变检查。费用金额与支付渠道仍未核验，未开放陌生用户运营额度，不能宣称全面商业上线或跨用户成功率已验证。

下一阶段执行提示词：
> 继续vibephoto已部署v22的自助交付。先读取本节与activation证据，保留原会话、原素材、75次剩余额度及OpenLux完整Sunburst-c高质量参数。蔡宝测试已经结束，不主动派发新生图；用户手动发起时保持封面认可后逐镜拍摄、全部失败与原版保留、无自动重试。当前最大瓶颈是已认可操作员交付尚未证明陌生用户能独立复现：先在不调用模型的情况下走通准备、拍摄计划、错误恢复、审片、修改、跨设备恢复与下载，修复任何阻断并记录失败位置；不扩页面或素材。不得把现有运营key或额度开放给其他用户，不新增付费资源；跨用户真图验证须有具体素材、接收渠道和额度授权。记录真实渠道账单后再判断收费与毛利，分别报告工程结果、用户认可与商业条件。部署沿用现有服务，保存回滚，核实公网实际版本。

---

# vibephoto 自助交付基础补齐 v22（2026-10-09）

- 用户要求继续开发并完整上线；结束的是蔡宝真人生图测试，本轮没有图片模型请求。已发布 `qjb-vibephoto-v22`，BUILD_ID `A8-ZEIax3mbuzWCLGgWSf`。根域 `/` 和 `/studio` 均302到 `/studio-next/studio`，公网页面实际显示v22。
- 正式worker新增显式OpenLux适配，完整记录 `OpenLux / gpt-image-2.5-sunburst-c / high / 1024x1536`；独立凭据、严格host、base64落盘、四参考上限、不自动fallback。McGrox仍为未另指定时的默认渠道。OpenLux只放行已经验证的竖幅；新适配本轮通过模拟请求工程测试，没有发出新的真人请求或声称修改质量已验收。
- 新持久化会话开拍授权按用户、渠道/模型、原始人物/角色/地点hash、到期时间、总额度绑定。队列预留额度，派发前原子核验并计入全部失败；旧/无授权任务不能派发。沿用原授权账本，当前25/100、余75；生产授权表仍空，未对陌生人开放运营凭据。仅收到明确启用授权后可用 `scripts/shoot-access.mjs authorize-caibao --authorized-existing-scope`登记现有原图scope，不新增额度或更换人像。
- 正式API重复请求先返回原任务，服务关闭或revision改变仍不重复计费；受控拍摄禁止一次批量六张。续拍每镜最多3次显式尝试，失败不耗尽其他镜头名额；已完成镜头仍需用户认可再继续。取消未派发任务释放预留，已经派发失败不退回总额度，不自动重试。
- 单张修改使用本人／上一版原片／角色／地点，不同时叠加续拍封面或封面构图而超过4参考。提示词明确上一版承担不变内容，原始三参考各守职责；不会出现图片0或第五图编号。原版和母版记录保留。实际修改精度与此参考取舍的画面效果本轮未新增真人验证。
- 私有作品库新增恢复码：随机32字节，数据库只存hash；通过POST请求体恢复，不写入URL、日志或公开页面。新码使旧码失效；已有其他作品的会话不能混合恢复。已验证公网独立空白工程创建201、无权限404、恢复200、恢复后读取200、旧码404、未授权开拍503，清理的只有本次空白工程。恢复码不延长素材30天保留期；已经恢复的设备会话不因码轮换自动下线。
- 审片主操作简化为“满意，用这张继续拍”／“都满意，认可这张”，分项评价折叠，明确文字说明用户确认哪些内容；用户点击前不代填认可。作品状态按该项目的真实认可数量显示，原组六镜显示6张已认可；不把单项目认可提升成全配方/跨用户验收。
- 工程181/181测试、typecheck通过、lint0错误/2条既有img警告。Linux生产构建与隔离预览通过后切release；Windows本地Turbopack sharp目录链接报错，使用已安装Webpack模式完成本地页面检查，没有修改全局环境。
- 公网桌面实际图片全部解码1024×1536；390×844手机document宽375，无横向页面溢出，分项评价默认折叠。浏览器整组下载真实落盘13651455字节，解包六张PNG与既有原图SHA逐字节一致；包含计划JSON。新ZIP计划记录变化不影响图片原字节。陌生会话项目／原图／ZIP均404。
- 三份关键工程、13张成片、任务与attempt记录与部署前SQLite快照完全一致；UID997/0600，授权账本25不变。19个上线源码文件hash匹配本地。health database=ok/schema2/worker=online/generation=false。
- 部署复用不可变依赖硬链接，源码独立复制，不执行npm install、不改nginx、不动旧站。发布前SQLite一致性快照与旧unit保存在 `/var/backups/zsm-photo-shoot/qjb-vibephoto-v22/`；回滚 `bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v22/rollback.sh`，不覆盖用户数据库，新增表兼容旧代码。回滚脚本已核实，未实际回退。当前可用磁盘约1.8GB。
- 证据 `.scratch/delivery-v22/{manifest,verification,download-verification,recovery-http-verification,recovery-public-verification}.json`、`public-results.png`、`public-mobile.png`、`public-library.png`。发布前源码保存在 `.scratch/delivery-v22-before/`。
- **仍有具体阻碍**：正式生产环境未配置任何生图凭据，生图开关保持关闭、授权表空；已询问是否允许把本机独立OpenLux凭据放入现有服务器受限秘密存储，并只给原会话原素材启用剩余75次。原因是原规则要求密钥只在内存使用，不能自行把部署授权解释成持久化密钥权限。用户未答复前不执行依赖操作。费用金额仍未知，未接未确认支付供应商，未证明陌生用户自助成功率。

下一阶段执行提示词：
> 只推进vibephoto正式自助开拍与交付。先读取v22实际代码和本节证据，确认密钥持久化及具体用户／素材／额度授权；缺失时完成不依赖生图的工作，不放开运营key给陌生人。沿用已授权渠道、实际完整模型ID、高质量与原账本，不自动fallback或重试，不重启蔡宝测试。由用户手动发起，一张封面认可后逐镜完成，失败与原版全留。唯一目标是新用户无口头指导完成准备、拍摄、认可、定向修改、跨设备恢复和原图下载；记录每步失败、等待、请求和实际账单成本，优先修阻断，不扩素材或新页面。生产验证失败即停止新请求并保留可回滚版本；分别报告工程通过、用户认可和商业条件，不宣称三者互相替代。

---

# vibephoto 生图测试结束，正式母版信息继承修正 v21

- 用户已认可独立复现封面，并明确“不是停止后续开发，是这个测试不需要测试了”。本轮结束蔡宝生图测试，继续网站开发；0新增模型请求，两端授权账本仍25/100、剩75。已把精确独立封面 `e0c731d2-1936-46dd-85e3-ebfc665baa77` 的认可原话和结束测试说明保存到项目/journal；没有代设新母版、续拍或发布私人作品。
- 已部署 `qjb-vibephoto-v21`，BUILD_ID `zgqp49Hx3wsU8yDcBrzdx`。正式approveCover从已保存资产/结果继承实际channel/model/quality/size；缺少资产记录时仅接受有完整参数的saved attempt，缺失或互相冲突时报明确信息，不再硬编码完整Sunburst。worker新结果、资产与attempt保存相同请求信息；操作员不再覆盖正式母版模型信息，仅保存聊天证据。
- 正式McGrox派发路径在onSubmit之前检查母版渠道/模型/质量/尺寸；OpenLux-c母版不能被静默送到McGrox。当前公共生成仍关闭，也未新增公共OpenLux接入或凭据。UI对信息缺失、记录改变、渠道不匹配给出可理解的错误；未扩页面/素材或修改提示词。
- 166/166工程测试、typecheck、lint0错误/2条既有img警告通过，Linux生产构建通过。新增无网络测试验证真实provenance继承、OpenLux-c不被改名、冲突/未知记录阻断、派发前渠道匹配及旧作品保留。复制数据库上的两份真实保存封面均正确继承OpenLux/c/high/1024×1536；仅复制库内模拟wouldShare/重新设母版，未改生产母版或派发模型。
- 公网health=v21/database=ok/worker=online/generation=false；浏览器作品页显示v21、原组六镜全部已认可。原六张与历史源hash不变，独立封面认可且continuity仍null。无cookie项目/资产/ZIP均404。证据 `.scratch/provenance-v21/{manifest,verification}.json`、`public-v21-results.png`；服务端 `operator/v21-engineering-validation/verification.json`。
- 沿用现有部署与配置，增量覆盖7个项目文件、隔离构建成功后切release；备份数据库与旧unit，原/studio和其他网站服务不变。可回滚 `bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v21/rollback.sh`，回退代码/unit不覆盖用户数据库。回滚脚本已确认可执行，未为演练实际回退。
- 为控制磁盘占用，只对新v21与v20中逐字节相同的node_modules文件原子硬链接去重，共28121文件，约744MB；源码和用户素材没有去重或修改。两个release的依赖目录按不可变版本处理，后续更换依赖在新release执行，不原位编辑。当前磁盘可用约1.9GB，未来发布需继续关注空间。
- 真人生图测试到此结束。接下来继续既有网站交付工作，保留本次已认可的效果与限制，不再主动启动重复生成测试；公共自助生成、支付和跨用户成功率不因本轮工程修正而宣称已完成。

---

# vibephoto 整套认可与独立封面复现（2026-10-09，v20）

- 用户回复“认可 继续”，精确第六镜 `6583c2e9-ab5e-4dee-a2c4-b5486d048e49` 已保存认可和原话，原工程 `e0c7c19a-951e-433c-b362-e8a8f0ab739e` 的setReview记录整套六镜连续性认可。六张原字节、母版及历史源数据不变，原缺陷仍保留，不把用户接受等同缺陷消失。
- 新私有工程 `380d047b-cddb-40fa-8a8b-4735a4f16d4c`，标题“蔡宝 × 奶蛙 · 配方独立复现 01”。独立重跑封面，仅用本人／奶蛙／外滩三张原始参考，未把已生成成片作为输入；prompt及三参考hash与原封面逐字节一致。编译配方story-six 3.1.0，prompt SHA256 `dd39324f7cc48da544f268bf3fa4eaa0cbe9005ba14fff31cfed8a8f18a6f9ab`。
- 明确沿用OpenLux `gpt-image-2.5-sunburst-c` high/1024×1536/n1，未额外试McGrox。单请求HTTP200/30725ms、自动重试0；北京时间2026-10-09 01:09:21发起。两端累计25/100、剩75；费用仍null，不能宣称免费或换算人民币。
- job `36a64575-fce1-414e-b05f-89821c79eaa8`，result `e0c731d2-1936-46dd-85e3-ebfc665baa77`，asset `f5f95f49-4ce3-4144-aacd-26381630d554`，2272892字节，SHA256 `7c4e5e6d827e42f01b963aea382267cbf83f2db3b86cd565cc374e963cbb5595`；请求ID `2f6de97e-56de-46c3-a2e8-b71749561bf2`。
- 公网刷新恢复新封面1/6，review=null、无continuity、下一镜禁用。真实大图解码1024×1536，点击保存原图实际落盘，SHA与服务器原文件一致。无cookie项目／图片／ZIP均404，原图UID997/0600；health v20/database=ok/worker=online/generation=false。执行方观察人物/衣服、角色颜色轮廓和现场看起来延续，人物竖拇指、角色V手势；角色细颗粒仍在。最终人物、角色与现场满意度由用户判断。
- 新增固定repeat操作员契约：先核验原组六个精确result/hash、已有前五镜认可、用户本轮整套认可及原始prompt；再独立复制参考与配方，禁止旧成片/continuity作为封面输入。只有该scope有明确认可证据且匹配指定渠道时允许直接OpenLux，原封面McGrox→明确fallback规则保持，未改变公共provider。合成测试覆盖错误hash/prompt/认可及渠道阻断、不提前代评、单次与幂等、原六镜保留。162/162测试、typecheck通过，lint0错误/2条既有警告。
- 操作员代码已更新到现有release且本地/远端hash一致，无页面扩张、release切换或服务重启。执行前SQLite一致性快照和旧脚本在 `/var/lib/zsm-photo-shoot/operator/caibao-bund-v20-controlled-repeat-v1-backup/`；恢复脚本即可撤销本轮操作员代码，不用旧数据库覆盖后续用户数据。
- 证据 `.scratch/controlled-repeat-v20/{request,verification,recipe-validation}.json`、`public-approved-six.png`、`public-repeat-review.png`、原图；服务器同scope。第六镜journal及原整组配方验证记录已更新用户整套认可。当前只有1套用户认可，新增独立封面尚待认可，不能宣称已验证第二整套或跨用户成功率。
- 下一步只审这张独立复现封面。认可后才逐镜检查第二套延续是否稳定；维持受控真人开拍，不扩页面、素材、地点或公开自动计费。

---

# vibephoto 第六镜与整组交付验证（2026-10-09，v20）

- 用户对展示的第五镜回复“确认”，精确pause结果 `3a4f2920-0422-4a09-97cc-ba934a21517c` 已记录认可及原话，保留之前公开指出的视线/细颗粒缺陷。母版及前五镜原字节、历史源6结果和所有失败保留。
- 仅派发detail「认真合影」1次，四参考顺序仍为本人／认可封面／奶蛙／外滩；OpenLux `gpt-image-2.5-sunburst-c` high/1024×1536/n1，HTTP200、187961ms、自动重试0。请求北京时间2026-10-09 00:28:47；两端累计24/100、剩76，金额仍null，不能推算渠道账单。
- job `41ac15b8-cb7a-45d3-b144-bd962057001b`，result `6583c2e9-ab5e-4dee-a2c4-b5486d048e49`，asset `05b70181-4dfb-454b-9536-f0bc74ff57f8`；2212092字节、SHA256 `61982f754ede4c29b2ebd427b9780d29ad1b34bd03da0c0a53f65c743b7635ae`，prompt SHA256 `47dcd12ec5cdfcf2f5e498a0eb9aa8df8cb89fa1d4444f240735277f9fcbb26a`。
- 公网刷新6/6，前五镜已认可，第六镜review=null。执行方观察：并肩朝镜头、脸部不遮挡、蔡宝竖拇指，黑衣和蓝调外滩看起来延续；奶蛙仍有细颗粒。最终人物、角色与整组认可留给用户，不将六张保存成功等同整套产品验收。
- **已补齐实际下载落盘缺口**：浏览器点击第5/6镜保存原图均拿到本地下载文件，SHA逐字节一致。浏览器点击整组下载得到13650711字节ZIP，完整读取六张PNG和计划JSON，全部图片hash与服务器一致，planRevision=3、母版未变、第六镜未代评。ZIP SHA256 `7badca7c7c1e2e33b95e24b5c35c9ebc4e3b0bef0800318582b23b4a0bbd5fb0`。下载文件在 `E:/Users/lsb/Downloads/`，仍为私有作品，未发布到公开作品墙。
- 桌面第六镜原图解码1024×1536；390×844手机大图无横向溢出、原图已解码，临时视口已恢复。无cookie项目／第六镜资产／ZIP仍404；六张文件UID997/0600。health=v20、database=ok、worker=online、generation=false。
- 操作员新增固定detail契约，核验精确第五镜hash与“确认”原话后准备；测试覆盖错误认可/错误hash阻断、四参考/真实模型/高质量、单次及幂等、原版保留、第六镜不代评。162/162测试、typecheck通过、lint0错误/2条既有警告。脚本已部署且本地/远端SHA一致，未切release或改产品页面。
- 可重演参数、逐镜prompt/input/output hashes、全部渠道尝试和已知失败条件存于 `.scratch/controlled-detail-v20/recipe-validation.json`，实际单人单地点一组证据，独立复现未验证。公网全站approveCover仍有历史模型硬编码限制，仅操作员流程正确继承真实渠道metadata，不宣称全站已解决。
- 证据 `.scratch/controlled-detail-v20/{request,verification,download-verification,recipe-validation}.json`、`public-detail-review.png`、`public-detail-mobile.png`；服务器operator同scope。执行前SQLite一致性快照及旧操作员脚本保存在 `operator/caibao-bund-v20-controlled-detail-v1-backup/`，只需恢复脚本即可撤销操作员代码，不直接覆盖后来用户数据。现有v20代码回滚沿用下方部署记录。
- 下一步仅收集第六镜及整套审片，未经认可不再生图。用户认可之后的唯一验证重点是同一配方能否独立重复获得满意作品；公共真人生成仍关闭，未把当前操作员交付泛化为陌生用户自助成功。

---

# vibephoto 第五镜受控续拍（本地2026-10-09，v20）

- 用户在第四镜审片后回复“继续”，据此记录精确motion结果 `613e475a-3c53-4eb9-8622-2da69c044904` 为认可/一致性确认，保存用户原话；没有把重复“继续”扩为批量生图授权。母版和前四镜原字节/失败全部保留。
- 仅续拍pause「换我营业」：真人回到前景视觉中心，角色侧后方看向真人；沿用四参考、OpenLux `gpt-image-2.5-sunburst-c` high/1024×1536/n1。单请求HTTP200/57974ms、自动重试0；两端累计23/100、剩77，金额null。请求UTC 2026-10-08T16:13:01.838Z，即北京时间10月9日00:13:01。
- job `337ae7d8-6bd4-429e-a323-7f8bd785ec98`，result `3a4f2920-0422-4a09-97cc-ba934a21517c`，asset `8cb05bac-14f4-49be-bacd-242447add25b`，2283823字节，SHA256 `9e78ed6f0bdd4d033f8affc5f3ef96fe68c1be1263f2a49476895ff374fd97f8`；prompt SHA256 `fabc7905b1faf30c0d2048bbabc86c76e7c8b043c5de951123ef98e67c449e64`。
- 公网刷新5/6，前四镜已认可、第五镜待评价、第六镜禁用。大图解码1024×1536，浏览器导出原文件SHA与服务器一致；文件UID997/0600，陌生会话项目/资产/ZIP均404，health database=ok/worker=online/generation=false。附件下载落盘本轮未验证，之前缺口仍保留。
- 执行方观察：前后景主次已交换、人物脸完整、服装/蓝调地点/角色轮廓看起来延续；**角色视线仍朝向镜头，未完全执行“看向真人”**，表面仍有细颗粒。第五镜review=null，不自动重拍、不继续第六镜；镜头执行记录保留该缺陷，由用户决定是否接受。
- 固定pause契约检查精确第四镜hash、用户继续指令；新增无网络测试覆盖完整逐镜认可/单镜/四参考/幂等及第六镜闸门。162/162测试、typecheck通过、lint0错误/2条既有img警告。只更新操作员脚本，无页面/素材扩充或release切换。
- 证据 `.scratch/controlled-pause-v20/request.json`、`verification.json`、`browser-original.png`、`public-pause-review.png`；服务端operator对应scope。下一步先审片，认可后只拍最后一镜detail，再完成整组下载实际落盘/解包验收。

---

# vibephoto 第四镜受控续拍（2026-10-08，v20）

- 用户对第三镜回复“认可”，精确结果 `845ff46c-0fad-41b9-a27f-dd1bdaff053b` 保存为认可/一致性确认并记录原话；封面母版、前三镜原字节及全部失败不变。
- 只续拍motion「反客为主」：35mm动态设计，奶蛙前景双臂展开、蔡宝旁边摊手，双方全身及地标可辨。沿用原四参考、OpenLux `gpt-image-2.5-sunburst-c` high/1024×1536/n1。单请求HTTP200/56862ms；无自动重试。两端累计22/100、剩78，金额null。
- job `c462cce1-f8f0-4a84-a85a-780e630cff11`，result `613e475a-3c53-4eb9-8622-2da69c044904`，asset `b59a5715-10a2-4241-9013-465a24e6b703`，2333377字节，SHA256 `44a9617aefe34e1537622d9c5da1bb223450e5881931edee9757dc7e4fcbb738`；prompt SHA256 `e283483b6414f851005080f529fd1b1a291bf52590358b8fff3d604a7dcf7a8f`。
- 公网刷新4/6、前三镜已认可、第四镜待评价、第五镜禁用。大图解码1024×1536；浏览器实际导出原文件SHA与服务器一致；UID997/0600，陌生会话项目/资产/ZIP均404，health database=ok/worker=online/generation=false。附件下载落盘本轮未验证，原缺口保留。
- 执行方观察：双方全身含脚、前后景抢镜关系、展开手臂及摊手得到执行，外滩仍可辨，人物和黑衣/蓝调光线看起来延续；奶蛙仍有细颗粒，动作更像摆拍而非抓拍。第四镜review=null，不代认可、不续拍第五镜。
- 操作员固定motion契约继承精确第三镜hash及用户原话，复用单镜准备/请求；测试扩展到第四镜的缺失认可阻断、四参考单请求、幂等、前三镜保留及第五镜审片闸门。161/161测试、typecheck通过、lint0错误/2条既有img警告。只更新操作员脚本，未改页面/素材/公共生成或切换release。
- 证据 `.scratch/controlled-motion-v20/request.json`、`verification.json`、`browser-original.png`、`public-motion-review.png`；服务端operator对应scope。下一步先用户审片，认可后仅续拍pause，不批量补完。

---

# vibephoto 第三镜受控续拍（2026-10-08，v20）

- 用户针对第二镜审片回复“没问题”，记录精确结果 `1212c01a-a935-4871-839e-520089e55c9a` 为用户接受/一致性确认；保留执行方“环境机位仍偏近”的审查意见，不改写成模型完美执行。封面母版与所有原图/失败不变。
- 仅续拍portrait「突然入镜」：85mm中近景，角色从肩旁探入，头部完整、不遮真人五官。沿用本人/封面/角色/地点四原字节参考、OpenLux `gpt-image-2.5-sunburst-c` high/1024×1536/n1。请求1次、自动重试0，HTTP200/56779ms；本地/服务器累计21/100、剩79，金额null。
- job `3786f614-4248-408a-8959-5cfe0209b8fd`，result `845ff46c-0fad-41b9-a27f-dd1bdaff053b`，asset `44620197-4fcd-4e5b-9611-db97da2f2408`，2301485字节，SHA256 `9849aa2b5867d8dfdcfc6a8c5d88e720832c8ee9aa45d678df23d47ce39d27af`；prompt SHA256 `c7ff2ec991cba6f74a4fe2411ffe6b6ce2709bc7c028d1be7c95a1ad0f7f3f4c`。生产私有工程同前，UID997/0600，母版/第二镜字节hash保持不变。
- 公网刷新恢复3/6、前两镜已认可、第三镜待评价、第四镜禁用；大图解码1024×1536，浏览器pageAssets导出与服务器SHA一致。陌生会话项目/资产/ZIP均404，health database=ok/worker=online/generation=false。本轮未重新验证附件下载落盘，沿用前轮明确缺口。
- 执行方视觉检查：肩后探头、完整角色头、不遮脸和更近的人像构图得到执行；人物黑衣、蓝调外滩及角色轮廓看起来延续。奶蛙仍有细微颗粒，搭肩动作略摆拍。最终身份/角色/现场认可留用户，第三镜review=null，不续拍第四镜。
- 操作员脚本新增固定portrait契约及精确上一镜hash/用户确认检查；准备阶段不派发，派发沿用单镜幂等和账本。新增无网络测试覆盖缺失认可、上一镜hash错误、保留母版、四参考/单请求以及第三镜未经认可时阻止第四镜。161/161测试、typecheck通过，lint0错误/2条既有警告。只更新操作员脚本，无页面/素材扩充，无切release或服务重启。
- 证据 `.scratch/controlled-portrait-v20/request.json`、`verification.json`、`browser-original.png`、`public-portrait-review.png`；服务端 `/var/lib/zsm-photo-shoot/operator/caibao-bund-v20-controlled-portrait-v1/`。用户确认第三镜后才进入motion；不要把两次被接受的候选推广为所有用户可稳定复现。

---

# vibephoto 用户认可封面后的单镜续拍（2026-10-08，v20）

- 用户在展示封面及三项审片请求后回复“没问题的”，据此将精确封面 `5bb46501-c16c-4abf-93f4-2d34ed2a8334` 记录为认可，并保存该聊天证据、固定其原字节为母版。封面SHA不变；下一镜未自动认可。作品工程仍 `e0c7c19a-951e-433c-b362-e8a8f0ab739e`。
- 操作员脚本新增固定第二镜place的prepare-place/dispatch-place/status-place，四参考依次本人、母版、角色、地点。本地发现连续性旧函数硬编码MODEL：仅在受控操作员准备流程将母版metadata绑定为已存真实OpenLux/Sunburst-c/high/1024×1536；未扩全站provider、页面、素材或开放公众生成。CLI以服务用户执行；同一镜/渠道已记录后不再派发。后续更换母版前仍需修复全站approveCover的真实provenance继承，不能把旧假设当作已改好。
- 本轮仅1次OpenLux `gpt-image-2.5-sunburst-c` high/1024×1536/n1，HTTP200，80293ms；没有再请求McGrox、没有自动重试。job `3c2289f0-b470-4025-b63e-b229a3b4baea`；result `1212c01a-a935-4871-839e-520089e55c9a`；asset `cc25331f-9ede-4c4f-8dc8-c83eec25ebee`；2218084字节，SHA256 `feafbb2b0596707bad250d549f26167f17eefdc5ba66ef3f3ebfadac66d22cb6`。prompt SHA256 `2ccc3a68b0c6e12bcd1e18d1664f5f72cb0bb0a0f4eeaf77b7c4a9cf470d929c`。两端累计20/100、剩80；费用仍null，旧502仍recoverable完整保留。
- 公网刷新显示2/6，封面已认可，第二镜待评价，第三镜因未认可上一镜而禁用。大图实际解码1024×1536；浏览器pageAssets导出原文件SHA与服务器一致；单图下载HTTP200，但未确认浏览器附件实际落盘。资产UID997/0600，陌生会话项目/资产/ZIP均404，health仍generation=false。
- 人工执行方审片：人物/服装/蓝调现场和奶蛙轮廓看起来延续；**镜头执行不合格**，环境镜仍偏近、人物腿部截断、主体占比过大，与封面差异不足。奶蛙仍可见细颗粒。保留此候选，review=null，不自动重拍、不给第三镜代填认可。下一步先用户审片；若重拍仅改变机位距离/构图，显式限定全身含脚、主体高度占画面45–55%、环境占主要面积，并避免母版构图压过镜头指令。后续对该镜修改会出现5参考超过已验证4参考，应先明确参考取舍，不能直接发送。
- 工程160/160测试、typecheck通过、lint0错误/2条既有img警告；新增3项无网络合成测试覆盖用户认可门、真实模型继承/4参考、单镜/幂等、失败保存及阻止下一镜。生产只有操作员脚本更新，无重构建/切release；全部原图/失败保留。
- 证据 `.scratch/controlled-place-v20/request.json`、`verification.json`、`browser-original.png`、`public-place-review.png`；服务端operator同名scope。尚未证明可重复获得用户满意的组照，不将技术成功等同镜头合格。

---

# vibephoto 受控真人封面验证（2026-10-08，v20）

- 范围仅蔡宝 × 内置奶蛙 × 外滩的单张封面；独立私有项目 `e0c7c19a-951e-433c-b362-e8a8f0ab739e`。历史源 `bba938a1-2c2f-44da-81dc-7892c8a50c97` 的6结果/8任务保留，无改写；没有扩页面、素材或开放公共生图。
- 三张原字节参考按 identity/companion/location 发送，prompt SHA256 `dd39324f7cc48da544f268bf3fa4eaa0cbe9005ba14fff31cfed8a8f18a6f9ab`；配方 story-six 3.1.0。参数 high/1024×1536/n=1，自动重试0。
- McGrox `gpt-image-2.5-sunburst` 返回502/7030ms，任务及unknown attempt保留，扣费不确定；按已有明确授权，操作员独立选择OpenLux `gpt-image-2.5-sunburst-c`，HTTP200/54601ms。两请求相同参考及prompt，仅渠道及渠道实际模型不同。不能把OpenLux-c记录为McGrox或完整Sunburst。
- 结果 `5bb46501-c16c-4abf-93f4-2d34ed2a8334`，资产 `34a43312-033d-43b5-91cb-2ea2b0ec4f79`，2285408字节，SHA256 `d3a876d8ba7b6eca9e5e577762634bcb1eac5e5f535733f18834bff2c76bd289`；生产SQLite及私有文件保存成功。授权累计19/100、剩81，两端计数已对齐；所有金额null，未核验账单。
- 实际浏览器发现操作员root写出的0600文件不可被web读取，已仅修复本项目4个参考/结果文件所属用户为服务UID997，保留0600；脚本CLI新增服务身份检查，防止root再次生成不可交付文件。操作员目录及journal/output同属服务用户；以后通过 `runuser -u zsm-shoot -- node scripts/shoot-controlled-cover.mjs ...` 执行。未改public provider或前端代码、未新增release切换。
- 修复后公网原图解码1024×1536；刷新恢复成功；浏览器pageAssets实际导出原图与服务器SHA256一致。浏览器点击单图附件及ZIP接口均有nginx HTTP200记录；download事件工具超时，未拿到附件/ZIP落盘路径，因此不宣称浏览器附件落盘及ZIP解包验收通过。原图可靠下载字节已由浏览器资产导出验证。
- 无cookie请求项目/资产/ZIP均404；源历史不变；新项目仅1结果/2任务、review=null、continuity=null。health database=ok/worker=online/generation=false，三网站服务active。
- 工程157/157测试通过、typecheck通过、lint0错误/2条既有img警告。候选图的奶蛙仍有细微颗粒感；人物像本人、角色及现场可信由用户判断，未代填评价、未设母版、未续拍。下一镜前应校验continuity/后续任务继承真实OpenLux-c生成metadata，不能沿用硬编码MODEL伪标渠道模型。
- 证据 `.scratch/controlled-cover-v20/request.json`、`verification.json`、`browser-original.png`、`public-cover-review.png`；服务端journal `/var/lib/zsm-photo-shoot/operator/caibao-bund-v20-controlled-cover-v1/request.json`。同渠道请求已记录后脚本拒绝重复派发；全部原版与失败保留。

---

# vibephoto 参考一致性与创作恢复 v20（2026-10-08）

- 校准网站实际请求中的奶蛙、奶龙与妙脆角猫形态；仅对实际 builtin 且 SHA256 匹配的内置原图启用视觉事实，不凭角色名覆盖用户上传版本。去除续拍一律光滑的材质约束，猫的六镜使用四足自然动作；操作员样片脚本与网站共用视觉事实。配方 story-six=3.1.0、real-place-six=2.2.0，仍标明真人效果待验证，不用工程测试替代审片。
- 选定授权后，一键原子准备缺失的内置搭子与可用地点图。不替换现有自定义参考，不复制名人身份，不派发生成。重复准备不新增文件；两份保存中任一失败则完整回滚。餐厅无实景图仍需上传。
- 普通上传和拍摄确认均提交 revision，服务端二次校验，旧窗口不会覆盖新参考或偷偷拍新计划。排队快照固定引用 hash/builtin 与配方；派发前再次检验实际字节，异常留失败记录而不发模型、不重试。下一集复制保留素材来源及权利 metadata。
- 长任务单请求轮询，页面或项目切换终止旧状态查询；网络恢复清除该轮询错误。恐龙对话随计划版本变化重置，保留已有项目和页面隔离。
- 本地153/153测试（24文件）及typecheck通过；lint零错误及2条既有img警告。HTTP验证私有持久化、上传旧revision409、坏图恢复、CSRF、会话隔离、批量参考授权与hash、重入幂等、复刻和下载、地点与剧情保存。六镜及ZIP/历史manifest工程测试只在隔离本地数据库使用纯色合成输入，没有写入公网成片或调用模型。
- 本轮0新增模型请求；已只读核对本地授权计数仍17/100、剩83，历史金额未知。公网生成继续关闭，渠道凭据、公共访客费用授权和真人样本闭环尚未解决；蔡宝母版未代为认可。
- 已发布 qjb-vibephoto-v20，BUILD_ID=mIlMkUklZp015B8-DrJHR。Linux生产构建通过；主域名/及/studio均302进入新版并保留查询参数。公网health database=ok、worker=online、generation=false，web/worker/旧正式三服务active、nginx通过。公网HTTP smoke通过普通上传旧版本409、坏图恢复、跨会话404、原字节下载、批量准备授权和幂等、复刻恢复、剧情/续集及未开放生成503；测试工程已清理。
- 浏览器公网页尾确认v20、三张既有作品实际解码、恐龙renderer=rive。拍同款进入准备页、显式授权后批量准备成功，提示只缺本人照片。360×800刷新后私有奶蛙和地点图仍解码加载，document scrollWidth345，无页面横向溢出，视口已恢复。证据.scratch/delivery-evidence/public-vibephoto-v20-preparation.png及public-vibephoto-v20-mobile.png。首张为准备前按钮状态、手机图为准备后刷新；未将点击等同模型成功。最后返回首页时浏览器工具超时，未因此重复创建或生成任务。
- 最近5分钟web/worker err级日志无记录。回滚 bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v20/rollback.sh 恢复v19代码与服务配置，保留数据库和当前主入口；脚本可执行且bash -n通过，未线上演练撤回。SQLite schema仍1，无迁移。

---

# vibephoto 主域名入口与恐龙 v19（2026-10-08）

- 用户明确要求直接上线zsm.cauai.fun；已核实旧根目录与/studio仍代理4195，之前新版只在/studio-next。现在三个精确入口/、/studio、/studio/以302跳转/studio-next/studio，保留查询参数。浏览器从根域名访问确实进入新版作品墙。旧服务仍active，ACME、其他路由、域名与证书不改；新站仍保持noindex及generation=false，主入口切换不等于开放付费生成。
- release=qjb-vibephoto-v19，BUILD_ID=taHW4CNNRf1LGzfHTgChF，health database=ok/worker=online/assistant=ans-dino-rive-guide-v3。已实测新版Rive加载，data-dino-renderer=rive，无console error/warn。
- 小恐龙按现有ANS原版ans-mascot.png做矢量重绘：连续胖墩轮廓、顶部三峰、短手脚、宽奶油嘴部与肚子、柔和径向渐变、大头比例；旧图字节不修改，不做像素编辑。本轮零生图调用。SVG/RML同源，Rive8442字节，无脚本。五动作与idle、局部眼位跟随保留；动作缓动改为已核对的cubic，避免机械匀速。Rive verify/inspect零问题，五动作headless截图逐个生成，非账户发布。
- 助手上下文快捷问题覆盖输入/审片/失败等阶段；修复「怎么选照片」原先落入通用答复、「下载原图」未指向当前结果、修改帮助及本人/角色/地点职责。导航仍来自真实工程状态，本地确定性问答，无ANS或其他模型私密文本传输，不宣称LLM代理。
- 桌面真实对话、选照片答复、拍照动作通过；手机360×800面板left4/right332/top123/bottom679，scrollWidth345，renderer=rive。暂停/继续aria-pressed、Esc收起通过，viewport恢复。截图.scratch/delivery-evidence/public-vibephoto-v19-dino.png、public-vibephoto-v19-mobile.png。
- typecheck通过；145/145测试（23文件）通过；修改组件/问答eslint零问题；完整lint2条既有img warning，前一运行的unused guideQuestions已通过实际接线修复。Linux生产build通过。
- 代码回滚bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v19/rollback.sh恢复v18，保留用户数据。主入口独立回滚bash /var/backups/zsm-photo-shoot/main-entry-20261008-v18/rollback.sh恢复旧nginx；这两个回滚范围独立。备份脚本已换为LF并校验bash语法，未为演练撤回网站。三张作品墙原图/全部私人作品保留。

---
# vibephoto 真实作品墙 v18（2026-10-08）

- 用户本轮明确授权：再试McGrox，失败则用OpenLux。本轮共6次独立图片请求：McGrox 2次（1成功/1 HTTP502），OpenLux 4次（全部HTTP200）；5个候选原图保存，2张提示词与参考冲突的不合格原版保留，3张人工审片通过进入作品墙。无自动重试；旧失败记录未覆盖。统一操作员累计17/100，剩83，实际金额未知null，不等于零费用。
- McGrox成龙×奶蛙×外滩：gpt-image-2.5-sunburst/high/1024×1536，50840ms；随后周星驰请求502/5477ms，说明间歇可用，不认定稳定恢复。OpenLux现凭据/models=200，仅列Sunburst-c/Flare-c；选gpt-image-2.5-sunburst-c/high/1024×1536，角色＋地点双参考，经/images/edits成功。两家独立凭据仅程序内存读取，无真人参考上传，不改用户Base URL或网站默认渠道。
- OpenLux初版周星驰奶龙为黑眼睛、基努妙脆角猫为三角玩偶，追查发现原脚本文字与内置图冲突。显式修正奶龙绿虹膜与妙脆角猫圆体/毛发/金色脆耳，其他人物/地点/参数保持，两次重新生成成功（26449ms/51434ms）。失败原版标记rejected完整保留在.scratch/showcase-v17-openlux-20261008；通过版和提示词记录在.scratch/showcase-v17-openlux-reference-correction-20261008；McGrox在.scratch/showcase-v17-retry-20261008。不是严格区域锁定实验，整图会重绘。
- public/showcase三图均复制渠道原字节，runtime/showcase.mjs登记渠道/实际model/high/尺寸/SHA256/审片时间；标记AI创作/虚构合影。人物与地标可辨认；材质仍有细粒，未宣称完美IP还原或独立用户本人相似度验收。公共示范不用蔡宝私有素材。内置IP权利仍pending，沿用已授权noindex验收预览，不当作第三方商业授权。
- 公网https://zsm.cauai.fun/studio-next/studio，release=qjb-vibephoto-v18，BUILD_ID=m_OYezO-C3TvjyeRwbrzM。三张原图公网逐字节SHA256与本地一致。真实浏览器原图dialog通过；拍同款创建独立私有工程进入本人照片上传，无名人身份参考。临时空测试工程已受控清理。手机360×800三图解码1024×1536，scrollWidth345，无横向溢出，viewport恢复。证据.scratch/delivery-evidence/public-vibephoto-v18-wall.png、public-vibephoto-v18-mobile.png、v18-public-verification.json。
- 本轮typecheck通过，141/141测试（23文件），Linux生产build通过。健康database=ok/worker=online，generation=false；公网陌生访客付费生成仍关闭，未把操作员成功冒充公共生产调用。旧/studio及同机其他服务保持active，nginx配置未改。
- 回滚：bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v18/rollback.sh，恢复v17b代码/服务配置，保留用户数据库与之后数据。发布包.scratch/qjb-vibephoto-v18.tar.gz仅309个manifest文件，无.env/私有素材/实验日志。后续突破优先校准角色输入与提示词事实，再验证本人同款结果；不以增加样片数量替代复现。

---
# vibephoto 作品墙与互动恐龙 v17（2026-10-08）

- 公共作品墙与私人作品库分开；首页不再铺私人蔡宝封面，个人结果仅在「我的拍摄」。所有「成片墙」当前界面改为「作品墙」。公共目录 runtime/showcase.mjs 只收真实生成、人工检查后的示范作品；目前为空，页面明确显示首批制作中。
- 制作了成龙×奶蛙×外滩、周星驰×奶龙×维港、基努·里维斯×妙脆角猫×塔桥三套请求，内置IP原字节＋许可地点资料照作为双参考，Sunburst/high/1024×1536/n=1。三次均HTTP502，耗时7975/5212/6511ms；无候选图片，不自动重试，不更换供应商。全量提示词、hash、参考职责、request-id、失败记录保存在 .scratch/showcase-v17。累计操作员授权计数11/100，剩89；本轮金额未知，不能写成零费用。公网蔡宝历史仍8次记录，新增失败不冒充蔡宝修改任务。
- 首页玩法卡展示实际地标原图和内置角色卡片，明确标注「玩法提案」，有图地点优先；点一次直接创建对应拍摄进入本人照片页，减少中间选择步骤。资料图和角色原图未像素编辑。
- 用户授权新画小恐龙SVG。scripts/build-dino.mjs用同一向量描述输出SVG与RML；官方Rive CLI 1.5.0 SHA256核验后在项目.scratch内使用，未全局安装。Rive含idle＋招手／思考／拍照／庆祝／困倦5个动作、action/lookX/lookY视图模型、眼睛跟随。无Rive脚本、不需签名账号；.riv为4975字节，WASM本地托管。verify/inspect零错误零警告，五动作已分别渲染查看；本地浏览器确认data-dino-renderer=rive，不是SVG降级。
- 默认只显示小角色；点击展开气泡对话、快捷问题、动作面板；支持Escape/失焦关闭、动画暂停、减弱动态偏好、页面后台暂停。问答是页面内确定性导航，不是通用LLM或新增ANS对话后端；文字不传给ANS或任何模型。
- 本地141/141测试（23文件）、typecheck通过；lint零错误及2条既有img警告；Windows webpack生产构建通过。360×800实测Rive与对话可用，document scrollWidth345，无横向溢出。发现展开动作后头部被滚走，已将面板改成固定头部／输入区、只滚动消息区。
- 公网最终qjb-vibephoto-v17b，BUILD_ID=lSvlf3r8BwBpWjspmUw_g；https://zsm.cauai.fun/studio-next/studio实际页尾匹配。初版浏览器发现Rive 2.44的stateMachines参数已弃用，改用当前stateMachine单值参数，不压制警告。修正版实际renderer=rive，刷新后未产生新的warn/error（工具仍保留v17两条历史弃用警告）。health database=ok/worker=online/generation=false/assistant=ans-dino-rive-guide-v2；三服务active、nginx通过，近5分钟err日志无记录。
- 公网实测保存问答、五动作入口、拍照动作、暂停/继续、Escape关闭和返回焦点；360×800手机scrollWidth345，Rive实际加载；视口已恢复。截图.scratch/delivery-evidence/public-vibephoto-v17b-dino.png及public-vibephoto-v17-mobile.png。remix HTTP smoke通过私有引用hash/刷新重开/下载、跨会话404、旧revision及任意URL拒绝、generation关闭；临时测试工程清理，无新增模型调用。
- 代码及SQLite一致性备份已保留。撤回本次全部变化回v16：bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v17/rollback.sh；仅撤回弃用参数修复回v17：bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v17b/rollback.sh。两脚本已核实可执行，不覆盖用户数据库。旧正式/studio保持原版本，更新范围为既有/studio-next预览。
- 样片生成仍被McGrox502阻断，不宣称已完成公共作品内容或开放真人生成。/models=200且列出Sunburst仅说明查询鉴权可用，不能代替图片接口成功。无自动重试；后续渠道恢复后才继续制作并逐张人工审查，不把空作品目录当作内容交付。

---

# vibephoto 体验与素材迭代 v16

- 本轮按用户“先别验收”的要求推进界面与产品操作，没有真人审片、新模型请求或额度消耗。采用 web-design-guidelines 做可访问性检查，按本机 Next.js 16.3.7 文档实现路由与构建。
- 首页以模板图片为入口；9套剧情各有镜头动作，18个真实地点可搜索、筛选。当前10个角色有展示图；7处地点有许可与署名明确的原字节资料照。新增香港、西湖和塔桥资料照；其余11处地点含2家餐厅仍明确提示参考待补，未伪造照片。部分Commons下载429，停止下载，没有无限重试。
- 上传本人照片是第一步；可选参数默认收起。说明支持悬停、键盘聚焦、点击与Escape，手机浮层限制在视口内。小恐龙沿用状态引导。
- 内置参考必须显式选用且确认素材使用范围。服务端只读固定目录，检查SHA256、尺寸、会话、revision、限流；保留source、rights及builtin元数据，不改图、不自动传模型。内置角色权利仍pending，不能据此宣称商业授权。
- 成片墙展示当前会话的真实生成结果，默认每个计划/镜头最新版本，可展开全部历史版本；查看原图、下载与一键复刻。没有作品时显示诚实空态。未公开蔡宝肖像，未用地标资料图或角色原图冒充成片。
- 复刻是独立工程：复制所选结果对应历史计划及当时参考的原字节，新ID、无结果/任务/母版认可，不自动生成。跨会话404、旧revision409，复制失败事务回滚，原工程不受影响；删除原工程不会破坏复刻参考。
- 本地137项测试通过（22文件）；一次与构建并行的sharp损坏图检查超时，单独重跑全套137/137通过，未改超时阈值。最后相关22项再通过。typecheck、lint通过（2条既有img警告），Windows webpack构建通过。HTTP story及remix smoke通过：目录、显式授权、hash、持久化、下载、跨会话404、任意URL拒绝、过期revision、generation关闭。0渠道调用；历史成本未知。
- 浏览器实测模板创建、角色内置图选用、计划导航、地点搜索；360×800页面无横向溢出，说明浮层left=68/right=348处于360px视口内。已修复浮层截断；手机选择模板的主按钮在浏览时保持可见。
- 已发布 https://zsm.cauai.fun/studio-next/studio，release=qjb-vibephoto-v16，BUILD_ID=cQ_ec-JGNP5SegOSi3yMh。首次服务器构建退出1且连接未保留完整输出，未切换线上；随后同目录生产构建成功，核对旧版本与备份后沿原部署脚本完成切换。公网health版本匹配、database=ok、worker=online、generation=false；web、worker、旧正式三项active，nginx检查通过。
- 公网remix HTTP烟测通过目录、原字节hash、明确授权、下载、刷新恢复、跨会话404、旧revision409及任意URL拒绝；临时测试工程已清理。浏览器实际加载蔡宝6个历史封面原图，默认最新版本及展开全部版本均可用；浏览器错误日志为空。360px公网照片墙scrollWidth=345，无横向溢出，视口已恢复。截图：.scratch/delivery-evidence/public-vibephoto-v16-wall.png、public-vibephoto-v16-mobile.png；截图只存本地，不公开私人肖像。
- 回滚：bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v16/rollback.sh，恢复v15代码及配置，保留当前数据库；脚本可执行且SQLite一致性快照已存。旧正式/studio保持原版本，仅/studio-next预览更新。SQLite schema仍1，无数据迁移；最近5分钟web/worker无err级日志。

---

# vibephoto 品牌更新 v15（2026-10-08，本轮）

- 用户已明确将产品更名为vibephoto。本轮更新首页与导航、浏览器title/application-name、ANS小恐龙署名、图片与ZIP下载文件名、导演台显示名称、npm包名和当前执行提示词。保留原有会话cookie、消息协议、项目ID、服务器服务名及所有原始素材。
- 结果页成功任务提示改为“本次镜头已保存”，六镜完成数独立显示，单封面不再提示整组“拍摄完成”。
- 已发布 https://zsm.cauai.fun/studio-next/studio，release=qjb-vibephoto-v15，BUILD_ID=nwcH-5hczHj6wGN3UvE4o。公网health版本匹配、database=ok、worker=online、generation=false；web、worker和旧正式三项active，nginx检查通过。角色原字节校验通过，沿用已授权验收预览。
- 本地typecheck通过，lint零错误／两条既有img警告。Windows默认Turbopack因sharp文件链接创建失败（os error 87），按当前本地CLI文档用next build --webpack构建成功；Linux服务器仍以默认Turbopack构建成功，未改变生产构建配置。
- 公网HTTP烟测通过持久化、上传／移除纯色测试参考、旧revision保护、坏图恢复、CSRF403、跨会话404、生成关闭503与旧接口410，临时测试工程已清理；没有合成成片或额外模型任务。
- 公网浏览器title、application-name、页首／页尾、小恐龙ANS × vibephoto均为新名。360×800手机实际量测innerWidth=360、body scrollWidth=345，无页面横向溢出；视口已恢复默认。截图public-vibephoto-v15-desktop.png、public-vibephoto-v15-mobile.png位于.scratch/delivery-evidence。
- 原图及ZIP实际下载落盘，文件名以vibephoto-开头；第3版原图1872845字节，SHA256=d4fac565b934855cf0fb60094e883a54f9ad327ea439bc0ae23c166861e20520，与改名前原字节一致。ZIP逐项CRC校验通过；不是将点击按钮当作下载成功。
- 发布后只读核实蔡宝工程仍6结果、8任务、8attempts、评价未填、continuity未绑定、trial计数8/100、剩92。web／worker最近5分钟err级日志均0条。本轮0新增图像调用，金额仍无账单依据；真实后五镜待明确母版认可。
- 回滚：bash /var/backups/zsm-photo-shoot/qjb-vibephoto-v15/rollback.sh，恢复qjb-cover-continuity-v14代码与服务配置，不覆盖数据库；脚本存在且可执行、备份含一致性SQLite快照，未额外演练线上回退。历史记录见下文。

---

# 明确封面母版与逐镜续拍 v14（2026-10-08，本轮）

- 已发布公网验收预览 https://zsm.cauai.fun/studio-next/studio，release=qjb-cover-continuity-v14，BUILD_ID=c5kYWA3wa6sfxuIG11zR9。服务器生产构建通过；公网health版本匹配、database=ok、schemaVersion=1、worker=online、generation=false、assistant=ans-dino-task-guide-v1。web、worker与旧正式站三项active，nginx检查通过；4196预览服务更新，旧正式/studio仍4195。
- 核心：POST projects/:id/continuity显式resultId＋revision，校验所属会话、当前计划、成功封面、人工人物／角色／现场／保存意愿评价。展示封面选择不等于续拍认可；新版本不替换已锁母版。改拍摄计划、参考或撤回关键评价解除绑定，已保存作品不删除。
- 母版与原参考hash在入队及派发前检查，快照持久化参考职责、配方、输出参数和继承规则。本人／母版／角色／地点分别承担身份、实际服装和现场连续性、角色形态、真实地标。提示词不复制母版姿态，不给续拍重新添加默认直闪光。
- continuation一次仅一个未完成镜头；前一镜须人工认可人物、角色、镜头和母版一致性后继续。五次续拍任务单独预留，历史封面／修改仍12次；失败也占额度，上限到达明确停止，不自动补次数。
- 本地133/133测试（21文件）、typecheck、生产build通过；lint 0错误、2条既有img警告。合成HTTP验收脚本scripts/shoot-continuity-smoke.mjs通过：第3版绑定、最新第6版不替换、母版ZIP原字节／清单、刷新恢复、旧revision409、跨会话项目／私图／下载404、生成关闭503且没有新任务。脚本仅localhost＋显式SMOKE_DATA_DIR允许合成seed。
- 手机390×844实测查看第3版母版、恐龙正确母版引导、Esc关闭并返回焦点；截图.scratch/delivery-evidence/local-continuity-v14-mobile.png为纯色合成验收，并非真实成片。尚未据此宣称手机body无横向溢出。
- 本地及公网持久化计数已只读核实：蔡宝6结果、8任务、8attempts、review全部null、continuity未绑定，trial已用8/100、剩92。本轮0模型调用／0新增额度消耗；金额未知，不写成零元历史成本。用户未认可具体封面，真实后五镜及母版继承效果未验证。
- 四参考／每图8MB为本地闸门，不代表渠道最大支持量。四参考真实编辑历史已成功，但continuation用途仍待真人样本验收；带母版＋原版的五参考非cover修改本地阻断，不能静默删参考。公开generation继续false。

- 公网HTTP烟测scripts/shoot-smoke.mjs通过：项目持久化、纯色参考上传／移除、旧revision保护、坏图恢复、CSRF403、会话隔离404、生成关闭503、旧接口410；临时测试工程已清理，未写入合成成片或新增模型任务。
- 公网390×844手机刷新恢复六个历史封面；选择第3版后，小恐龙“对比与评价封面”保留第3版，未代填评价。当前图片已解码为1024×1536；视口390，body/document scrollWidth均375，无页面横向溢出。默认桌面与手机截图：.scratch/delivery-evidence/public-continuity-v14-desktop.png、public-continuity-v14-mobile.png。手机视口已恢复默认。
- 本轮公网“保存这一张”通过浏览器下载能力实际落盘，1872845字节，SHA256=d4fac565b934855cf0fb60094e883a54f9ad327ea439bc0ae23c166861e20520，与第3版原始输出一致。证据副本public-continuity-v14-download.png；未把仅点击下载当作完成。
- 发布后再次只读核实真人工程：6结果／8任务／8attempts／评价未填／母版未绑定／授权计数8。web和worker最近15分钟err级日志均0条，不将此推断为没有任何应用错误。
- 发布备份 /var/backups/zsm-photo-shoot/qjb-cover-continuity-v14 包含旧代码指向、服务配置及SQLite一致性快照；回滚命令 bash /var/backups/zsm-photo-shoot/qjb-cover-continuity-v14/rollback.sh，恢复qjb-ans-dino-v13b代码与服务配置，不覆盖用户数据库。已核实脚本存在且可执行，未额外演练线上回退。


---

# ANS 小恐龙接入与公网 v13（2026-10-08）

- 已发布 https://zsm.cauai.fun/studio-next/studio，release=qjb-ans-dino-v13b，BUILD_ID=A13mSi8NoJj5qzjBdPZHu。服务器生产构建通过；公网 health 版本匹配、database=ok、schemaVersion=1、worker=online、generation=false、assistant=ans-dino-task-guide-v1。web、worker、旧正式站点三项服务active，nginx配置检查通过；原正式 /studio 与其他项目未修改。本节下方的 v12 记录是历史版本。
- 公网修正版验收：选第3版后经恐龙进入封面评价，仍保持第3版，焦点studio-review且评价未勾选；进入生成记录显示全部8次/保存6次/2次unknown，焦点studio-costs。390px手机无横向溢出，恢复默认桌面视口后恐龙图片已解码、无溢出。此前v13原图下载与本地材质版SHA256逐字节一致，跨会话工程及私有图片404；v13b仅修复评价入口版本选择行为。首页最终截图：.scratch/delivery-evidence/public-ans-dino-v13b-desktop.jpg。
- 恐龙公网素材SHA256与ANS原图一致：0EC28E374DDA70ED6527903E668119C2029735D0B570A752A92D60E4FFD05659。本轮0新增模型请求、0额度新增消耗；金额未核验而非零价，原6结果/8任务、失败、评价与试拍额度8/100保持。
- 发布前已保存代码、配置及SQLite一致性快照。修正版回退命令：bash /var/backups/zsm-photo-shoot/qjb-ans-dino-v13b/rollback.sh，恢复v13；整个恐龙接入回退：bash /var/backups/zsm-photo-shoot/qjb-ans-dino-v13/rollback.sh，恢复v12。脚本已核实存在且可执行，只回滚代码与服务配置，不覆盖用户数据库；未为演练额外回退线上。
- ANS 现网源码来自 haika-1757 的 /srv/ans-releases/ans-product-3277abe1231e2b58/source，复用 dino-guide / dino-task-context 的任务快照机制及 public/mascot/ans-mascot.png 原字节（SHA256=0EC28E374DDA70ED6527903E668119C2029735D0B570A752A92D60E4FFD05659）。这是现网导航与工作流引导的取景簿适配，非对话后端或自主模型代理。
- app/lib/shoot-dino.ts 只从真实任务状态生成引导；components/shoot-dino.tsx 负责浮动入口与操作。导航走现有私有接口，生成、重试、认可、删除不在助手动作集合内。没有向 ANS 传送私人输入、照片、项目ID、凭据或模型响应，无额外模型调用。
- 本地浏览器验证：查看生成记录进入真实8条记录（含2条费用未知）；封面评价区导航不代填评价；作品库提示不带残留编辑工程的私人状态；选玩法聚焦首页；Esc焦点返回与点击外关闭通过。390×844手机无横向溢出、面板在视口内、角色图加载正常。
- 工程检查118/118测试（20文件）、typecheck、lint 0错误／2条既有警告、本地生产build通过。小恐龙状态测试覆盖访问上下文隔离、真实进度、失败保留、计费不确定、镜头/版本计数及真实认可。公网生成维持关闭；蔡宝6封面/8任务、原始失败与所有未填评价保持。

---
# 蔡宝 × 奶蛙 × 外滩：单变量封面实验（2026-10-07，当前状态）

- 本轮仅打磨同一个封面，未新增页面、角色或地点，未生成后五镜。四个候选都来自第2版母版 result=4826e98b-7d69-407a-92d6-5991b492c51e，各改变一个提示词变量；没有串行叠加四项修改。模型编辑仍会重绘非目标区域，不能宣称严格区域锁定。
- McGrox 沿用 Windows 用户级 OPENAI_BASE_URL 原值 https://www.mcgrox.top/v1，固定 gpt-image-2.5-sunburst、quality=high、1024×1536、n=1，/images/edits 四参考顺序为本人／第2版／奶蛙／外滩。密钥仅内存读取。本轮四次独立派发全部 HTTP200，未自动重试；重复执行已登记的 material 实验返回 already-recorded-no-dispatch，未增加额度。
- 总额度计数 trial:authorized-caibao-trial-2026-10-07=8/100，剩余92次，失败也占额度，十年窗口不随日期或重启重置。累计6个成功封面版本、2次历史502，不是六镜组照。费用仍未知（null），不是零元；不将模型用量换算成未经核实的人民币价格。
- 502诊断：旧失败耗时8646/8751ms，小于客户端240秒超时，旧记录缺少 request-id 与上游详细诊断。本轮 /models=200，仅证明列表鉴权；四次编辑=200，证明当前请求链路可用。公开渠道文档把502解释为上游网络或账号临时异常，但无法据此确认本例具体根因，也不能宣称供应商故障已修复。已补齐白名单响应头、请求ID、错误类型/关键词信号；不保存可能回显密钥的自由文本错误消息。

| 版本 | 单变量 | 观察与副作用 | 当前决定 |
|---|---|---|---|
| 第3版 | 奶蛙材质 | 细绒明显减少，连续光滑CG更接近角色参考；真人面部和嘴弧有细微变化 | 优先交用户审片，未认可 |
| 第4版 | 奶蛙造型 | 比例与眼位变化，脚悬空，接地不可信 | 产品不合格，保留原始输出，不合并 |
| 第5版 | 蔡宝相似度 | 面部有小幅变化 | 是否更像由用户/蔡宝判断，未代评 |
| 第6版 | 现场光影 | 暖冷方向与遮挡更明显，左侧暖边光偏戏剧化 | 保留比较，不直接替换封面 |

- 操作员实验配方 runtime/cover-experiment.mjs（caibao-bund-controlled-v1）记录适用输入、参考职责、固定参数、失败条件和验证状态。scripts/shoot-cover-experiment.mjs 将真实 prompt/hash、输入hash、请求ID、用量、耗时与原始输出持久化；每个因素仅一个样本。请求可重演，独立复现未验证，用户认可未完成，尚未推广为生产配方。完整观察在 .scratch/delivery-evidence/controlled-v1-evaluation.json，各 controlled-{factor}-v1-request/provider.json 与 output.bin 保留。
- 公网仍为 https://zsm.cauai.fun/studio-next/studio，release=qjb-real-cover-v12，BUILD_ID=7sHarr4s2lg7cxfJslVwh；本轮操作员代码仅本地，本次只追加私有数据。公网私有工程 bba938a1-2c2f-44da-81dc-7892c8a50c97 保留6结果、8任务、8成本记录与原版关系，所有用户评价保持未填。generation=false，未对陌生访客开放付费生成。
- 数据追加使用 .scratch/append-private-shoot.mjs：核对共同历史和输入/输出hash，事务追加，幂等，保留公网已有评价、封面和保留期限，owner重绑定，授权计数取最大值；隔离测试覆盖二次追加0、评价不覆盖、owner隔离。服务器一致性备份 /var/lib/zsm-photo-shoot/append-backup-af2ceeb1-4d6d-4e92-ac4f-cd6e63bdaa01.sqlite，权限600。不要直接恢复覆盖后来用户数据。临时传输包追加后已删除。
- 追加时 root 创建的4个新图片一度不能被服务账户读取；已逐个修正为 zsm-shoot:zsm-shoot、权限600，浏览器重载后正常。以后追加应以服务账户执行，或者显式验证新文件所有者，不能仅检查磁盘文件存在就认为交付成功。
- 公网真实验证：桌面对照第2/3版均解码1024×1536，点击“保存原图”完成下载，下载SHA256=d4fac565b934855cf0fb60094e883a54f9ad327ea439bc0ae23c166861e20520，与本地材质版逐字节相同；390×844手机刷新后恢复六版本，无横向溢出。其他会话请求工程和新图片均404。证据为 .scratch/delivery-evidence/public-controlled-material-compare.png 与 public-controlled-material-mobile.png。health=200、database=ok、worker=online，既有 web/worker active。
- 本轮工程检查：typecheck通过，103/103测试（19文件）通过。无前端修改，本轮未另跑lint/生产构建；前轮v12构建记录见下方，不将前轮检查冒充本轮执行。工程验证不等于人物认可或稳定组照。
- 回滚代码：bash /var/backups/zsm-photo-shoot/qjb-real-cover-v12/rollback.sh，恢复代码/unit，不覆盖用户数据库。本轮私有追加已备份；若要撤回新增记录，需先检查后续用户修改并做受控数据恢复。
- 下一步仅收集用户对具体封面的认可。已发现续拍缺口：runtime/store.mjs 的 set 审批取最后一张封面，而不是明确选择的认可版；后五镜参考计划没有自动继承认可封面。用户可能选择第3版，不能靠给第6版代填评价绕过门槛。下一阶段唯一重点：把明确认可的封面变成可靠组照母版，先修正续拍选择与参考继承并完成无费用验证，用户认可后逐镜验证一致性，禁止盲发五张。执行提示词见 docs/prompts/04-beta-and-launch.md。

---

以下为前轮及历史记录；额度、请求数量、版本和缺失素材等信息以本节当前状态为准。
# 公网 v12 与蔡宝真实修图（2026-10-07，前轮记录）

- 用户本轮明确授权更新现有公网。已部署 https://zsm.cauai.fun/studio-next/studio，release=qjb-real-cover-v12，BUILD_ID=7sHarr4s2lg7cxfJslVwh；原 /studio 和其他项目未修改。health=200、database=ok、worker=online、generation=false，三个既有服务 active。这是公网验收预览，未向陌生访客开放付费生成。
- 用户指定附件中的朋友蔡宝；试拍总授权上限100次派发，已累计4次：2张成功、2次HTTP502（计费不确定），没有自动重试。原始413×878人像原字节使用，未裁切、去播放按钮或重新编码。只完成六镜中的封面及其修改版，后五镜未拍；不代用户或蔡宝填写人物/角色认可。
- McGrox沿用Windows用户级Base URL原值 https://www.mcgrox.top/v1；显式模型gpt-image-2.5-sunburst、quality=high、n=1、size=1024x1536、response_format=b64_json，POST /images/edits multipart image[]。首张用人物/角色/地点三参考，修改用人物/原片/角色/地点四参考。2次请求成功证明本次上传与返回可用，不证明底层模型身份或跨样本一致性。
- 原片 result=9189b0fc-3132-473f-9883-7b67ef690fb5；修改版 result=4826e98b-7d69-407a-92d6-5991b492c51e（HTTP200，48768ms，PNG 1024×1536，2009233字节；input_tokens=7363、output_tokens=6240、total_tokens=13603）。已打开检查：闭嘴微笑、浅绿眼缘、手势更贴近奶蛙参考，真人脸做了校正，角色材质仍有微细绒感，未通过严格材质还原验收。
- revision-v2与revision-v4返回502，分别8646ms和8751ms，状态UPSTREAM_UNCERTAIN。全部失败、用量和未知费用保留；渠道未返回可核实人民币扣费，金额仍null而非0。SQLite固定授权计数trial:authorized-caibao-trial-2026-10-07=4，十年窗口不跨日重置；所有失败也占总额度。
- 原片与修改版已从本地私有工程48db9955-574b-434d-8450-4adcdabb7182迁入公网当前浏览器私有工程bba938a1-2c2f-44da-81dc-7892c8a50c97，保留2结果、4任务、4成本记录与原版关系，owner在服务器重绑定。照片没有用于公开首页，不存在public素材路径，文件权限600；临时服务器传输包成功后删除。当前工程保留至2026/11/6。其他会话读取工程或照片均404，陌生浏览器不能用同一链接读取私有作品。
- 公网浏览器实测：桌面图片原始尺寸正确、原片与修改版对照可用、刷新恢复；390px手机图片正常、无横向溢出；点击“保存这一张”完成真实下载，SHA256=8b67c3792a430b6c05768ecdf482ff52ad53575bdf4b18c8993fbf209e90ce35，与修正版原字节一致。证据在.scratch/delivery-evidence/public-v12-compare.png、public-v12-mobile.png及revision-v2/v3/v4-provider-result.json。
- 工程验证：100/100测试（18文件）通过、typecheck通过、lint 0错误（2条既有img警告）、服务器生产构建通过。公网shoot-story-smoke通过创建/保存/恢复、严格校验、私有隔离、同款隐私、下一集契约及生成关闭，0模型调用。工程验证不能代替人物认可和角色材质验收。
- 角色图库rights仍pending，用户部署授权不等于第三方版权许可。本次使用显式--authorized-preview，仅允许/studio-next且generation=false；校验全部原资产hash与来源，不将rights伪改为clear，不作为可收费公开生成版验收。
- 部署复用既有runtime.env，密钥未写源码或日志；nginx未改，检查通过。备份在/var/backups/zsm-photo-shoot/qjb-real-cover-v12，含旧release指向、unit、env、nginx与一致性SQLite快照。回滚：bash /var/backups/zsm-photo-shoot/qjb-real-cover-v12/rollback.sh；恢复代码/unit，不覆盖用户数据库。未为演练切回旧代码。
- 下一阶段集中验证奶蛙光滑哑光材质与真人认可，先解释并修复502，再做受控单变量样本；不增加IP/地点/页面，不靠无限重试。现有100次授权剩余96次，仍按质量验证需要使用，不以用完额度为目标。

---

以下为历史记录；“缺少照片、0请求、预算待授权”已由上方当前记录取代。
# 本次试拍授权更新（2026-10-07）

- 用户最新明确授权：“本人照片你自己找 找到就允许 上限一百张 不要考虑报价”。本次试拍总上限100张，无需再次询问报价或人民币预算；保持McGrox与gpt-image-2.5-sunburst、高质量，每次n=1。失败或状态不明的已发送请求也保守占总额度，无自动重试、不跨日重置授权。先检查首张，再按最大失败变量决定后续批次，不以凑满100张为目标。
- 已只读检查两个本地私有SQLite库和项目素材、Windows图片／桌面／下载目录，另检查历史附件中的近期图片与汽车参考样本、个人记忆中的照片线索。当前库只有纯色测试参考；个人图片目录主要为其他项目的AI角色与场景资产，未发现可确认是用户本人的真人照片。未把其他项目角色、路人或测试图当成本人上传。
- 请求预览已记录新授权，providerCalls仍0；未发送照片、未新增模型费用、未开启公开生成。下一步仅需用户提供本人照或明确路径；多参考接口合同仍待渠道核实，由执行方继续解决，不把报价未知作为重复审批理由。

---

# 真实封面准备与交互补验（2026-10-07）

- 已恢复浏览器验证：此前被阻止的是失联页的data协议标签；本轮读取新的正常HTTP预览标签，未绕过安全拦截。桌面与390px手机首页图片正常，手机无横向溢出；创建剧情、设置保存与刷新恢复通过。
- 实测发现并修复：手机作品页的分享／下一集挤在照片前，已移至审片之后；六镜改为手机横向缩略条，让选中照片、评价、修改相邻。大图查看器原先使用旧旅行镜头名，现读取所选计划的真实剧情镜头名和标题，历史计划也使用自身快照。
- 使用明确标注“工程验收｜纯色测试图，非生成作品”的本地项目验证：快捷修改填入与焦点、选择作品封面、三项评价保存刷新、原片／修改版切换及并排比较、Esc关闭焦点返回、单图下载与ZIP内图片逐字节一致、下一集继承本人和角色参考且不带旧地点。删除测试源项目后续集参考仍独立可读。两个本轮测试项目已清理，不计入真实样本；下载文件已移入证据目录。
- 最终99/99测试通过（18文件），typecheck通过，lint 0错误／2条既有img警告，生产构建通过：BUILD_ID=z-voWcILnT8kaI60kX0iZ。本地health仍标识qjb-stories-v11-local；未部署服务器、未开放生成。
- 2026-10-07重新读取Windows用户级配置：Base URL实际为https://www.mcgrox.top/v1，密钥存在；没有改写配置或打印密钥。对该原样地址GET /models返回200，列出gpt-image-2.5-sunburst等3个Image2.5 ID。这只验证列表与鉴权，未验证生图、参考编辑或真实模型身份。图片请求0，新增模型费用0。
- 当天复核https://www.mcgrox.top/grox-usage-docs.html：公开文档图片示例仍只有/images/generations、gpt-image-2与方形尺寸，未找到/images/edits、多参考传法或Sunburst单价；计费指向站内后台。官网公开抓取没有可读价格，站内定向搜索未发现补充契约。不把“兼容OpenAI”当作多参考契约验证。
- 本地请求预览：.scratch/delivery-evidence/cover-trial-request-preview.json。目标奶蛙×外滩，story-six 3.0.0，cover一张，1024x1536，high，gpt-image-2.5-sunburst；建议总量最多3次，不自动重试。当前approvedMaxRequests=0，预算／单价／参考文件均未授权或未确定。预览不含密钥，没有发送素材。
- 证据：desktop-stories-v11.png、mobile-stories-v11.png、mobile-review-v11-synthetic.png、desktop-compare-v11-synthetic.png、download-v11-synthetic.png/.zip，均在.scratch/delivery-evidence。后四项只证明工程操作，不证明图片质量。
- 启动真实试拍仍缺：指定本人与奶蛙参考及发送McGrox的授权、费用上限与有效计费依据、多参考接口契约。目录图片再发布许可也仍待确认，不公开部署当前图片版。下一阶段不继续扩页面，集中完成这些条件后验证第一张真实封面。

---

# 剧情拍摄本地迭代（2026-10-07，v11）

- 本地入口：http://localhost:4206/studio-next/studio?view=intro；health version=qjb-stories-v11-local。生产构建 BUILD_ID=jbOvMDaUPFDz0paZk10lz。未部署；下方 qjb-characters-v9 是上次线上记录，本轮未重新核验线上。
- 首页三套剧情：订了两位，来了一位显眼包／我在拍大片，它在抢镜／我赶行程，它原地放空。10张角色原图与六镜剧情提案明确标注非生成样片。首页角色、地点、剧情共用选择；拍摄项目保存好玩程度、摄影风格与关系。runtime/stories.mjs 是版本化配方，story-six / 3.0.0，旧配方兼容。
- 后端新增单张cover任务；人物、角色和构图评价通过后才续拍缺失五镜。失败封面不能绕过确认变为六次请求；幂等保护、未知计费确认和已有重试上限继续生效。修改保存原版本，可选择作品封面；历史计划保留自身剧情、画幅和评价。
- 同款链接仅含目录选项，不含照片、私有文字或工程ID；导入不自动创建项目。下一集经明确操作在本站复制本人及角色原字节到独立项目，不继承旧地点／构图参考、自由文字、任务或作品。
- 工程验收：99/99测试（18文件）通过；最终typecheck及生产build通过；lint 0错误，2条既有img警告。scripts/shoot-story-smoke.mjs通过创建／保存／恢复、非法版本与地点拒绝、访问隔离、同款隐私、下一集契约、生成关闭与临时项目清理。测试使用注入的fake provider，不代表真实模型或成片通过。
- 浏览器前段检查：剧情创建、设置保存刷新、复制同款与新标签恢复通过。本次恢复会话后浏览器工具拒绝访问，未完成最新手机视觉、结果页按钮逐项复测及本轮截图；不能沿用v10截图作为v11证据。HTTP与构建不能替代这些验证。
- 运行状态：本地数据库ok、generation=false，worker未启动。预览已通过可追踪终端会话启动；隐藏后台启动被执行策略拒绝。本轮0次真实模型请求、0新增模型费用，费用单价仍未知。
- 发布门槛仍有两项：public/characters图片的再发布许可未确认，部署脚本维持rights闸门；真人／角色／实景发送McGrox及费用未授权，生成维持关闭。未改服务器、未改正式/studio，亦未增加付费资源。
- 下一阶段只验证获授权的真实封面效果，执行提示词已更新至docs/prompts/04-beta-and-launch.md。不要用继续扩角色数量替代人物、角色与地点的真实成图验收。

---

# 角色图片本地审查（2026-10-07）

- 本轮未部署。线上仍为下方 qjb-characters-v9；本地目录版本2026-10-07.2。
- 首页与工作区改为10个角色原图卡片，选中缩略图、别名搜索、分类、键盘选择与原拍摄项目共用角色ID。豆包形象待确认、悲伤蛙图片待补，折叠展示。
- 原始文件保存在public/characters；来源、原图URL、尺寸、SHA256与rights状态见runtime/character-artwork.mjs。10张均为原样下载，未抠图、裁图、去水印或重新编码；网页采用contain与unoptimized。仅供本地视觉审查，图片不自动发给模型。
- 发布阻碍：尚无这10张素材的网页再发布许可依据。scripts/check-character-artwork.mjs已接入部署脚本，pending素材会在切换release之前终止。取得对应许可并记录依据后才可改为cleared；打包时须加入public/characters并使用新release ID，不能覆盖v9。
- 验证：typecheck通过；build通过；lint 0错误、2条既有img警告；角色回归6/6通过；浏览器桌面及390px手机无横向溢出，10张全部加载；别名搜索、Enter选中、工程中切换角色、保存刷新恢复通过，控制台无错误/警告。无付费生成调用。
- 证据：.scratch/delivery-evidence/desktop-character-images-v10-local.png、mobile-character-images-v10-local.png。

# 当前运行与验收（2026-10-07，角色库 v9）

最新预览 **qjb-characters-v9**，BUILD_ID **FNXLrBmtogebYf1bAEIKN**，https://zsm.cauai.fun/studio-next/studio。正式 /studio 保持旧版，HTTP200。下方v8及更早记录为历史。

- 新增12角色名称卡＋自带角色入口；首页和工作区共享搜索、别名、分类、来源说明。选中角色贯通地点卡、项目保存、上传标签、六镜计划、请求编译和任务快照。豆包形象未确认，明确标注；没有下载IP素材或以文字卡冒充角色图片。
- 向后兼容旧frog项目；通用companion模式。切换角色清除当前旧角色参考，历史快照引用仍保留；独立会话不可读取；solo不发角色。多图验收闸门覆盖新旧模式。JSON增加可选characterId，schema仍1，无破坏性迁移；新配方2.1.0。
- 搜集项目：https://github.com/ThySummer14/meme-archive。GitHub API license=null，本次仅作为发现线索，未复制图库、整库文案或执行上游代码。脚本 node scripts/collect-character-candidates.mjs 在线抓取成功：376源条目，36候选，输出 .scratch/character-candidates.json；含抓取时间与源SHA256，人工审核后才进runtime/characters.mjs。可用 --input 指向下载的JSON离线复核。不作为实时榜单。
- 90项测试通过（17文件）；typecheck及本地／服务器build通过；lint0错误、2条旧组件img警告。新用例覆盖全部13种角色入口×6地点×6镜、名称不串用、未知角色拒绝、换角色清理、跨重开恢复、历史保留与隔离、solo过滤、旧frog升级。
- 本地和线上HTTP四参考冒烟通过，验证新characterId持久化、无效ID拒绝、角色切换后旧素材404、地点输入不受影响、会话隔离及生成关闭；合成测试文件原字节保存，测试项目已清理。线上浏览器390px手机搜索肥嘟嘟、键盘选择、创建外滩计划、六镜查看和刷新恢复通过；本地工作区乌萨奇→奶龙→肥嘟嘟切换通过。桌面完整角色卡目视验收。
- 线上 health：database=ok、worker=online、generation=false；三服务active，近期错误级日志无条目。0次模型调用，0新增模型费用；角色实际外形与多参考成图仍未验证。
- 证据：.scratch/delivery-evidence/desktop-characters-qjb-characters-v9.png、mobile-plan-qjb-characters-v9.png。截图为实际页面，无像素修改。
- 回滚：/var/backups/zsm-photo-shoot/qjb-characters-v9/preview-release.before 指向 qjb-places-v8。指回该release，恢复同目录web.before/worker.before至两preview unit，daemon-reload并仅重启zsm-shoot-web/zsm-shoot-worker，核对health。无需改nginx或删除数据。回滚前需注意v8不支持编辑新增companion计划；v9新增计划仍保存在数据库，回滚用于故障隔离而非旧版完全兼容承诺。

---

# v8历史运行与验收（2026-10-07）

最新预览 qjb-places-v8，BUILD_ID CBAIlH1C3_Q3QdHiJ6jts。地址 https://zsm.cauai.fun/studio-next/studio。原正式 https://zsm.cauai.fun/studio 未替换，HTTP 200。下方早期 Mock/OpenLux 实验手册保留为历史资料，不用于当前版本验收。

## 本次两轮实施

1. 改成真实地点与有互动的奶蛙合影／单人打卡，六地目录附来源，四张许可明确的地标照片保留下载原始字节。地点卡不冒充生成样本，餐厅不以别处照片冒充内景。Mercato 店方资料与涩谷官方旅游页访问成功；CÉ LA VI 页面访问受限／超时，已标明营业与内景待复核。
2. 本人／角色／地点／导演构图独立输入。统一引用顺序编译与传图；角色未上传不可排合影任务，餐厅未上传实景不可排任务。换地点清除旧地点参考，保留历史任务引用；切单人不发送已保存角色图。手机布局、互动镜头与机位标签二次校正。

## 已验证与限制

- 84项测试通过（16文件）；typecheck通过；lint 0错误，2个未修改旧组件 img 警告；本地与最终服务器生产构建成功。
- 纯色工程数据测试：四角色私有上传及字节原样保存、跨会话隔离、陈旧版本拒绝、换地点清旧参考、计划保存恢复、重复请求、历史版本、六镜结果和ZIP。纯色文件不代表真实生成。
- 线上 qjb-places-v7 完整HTTP交付脚本和web/worker重启恢复通过；v8仅修地点资料链接与说明，重新构建并通过地点四角色HTTP冒烟。v8手机新建外滩奶蛙计划、六镜详情、刷新恢复通过；首页地点图片均正常加载。
- 桌面、390px手机和本地360px手机检查无横向溢出；筛选国内／海外／餐厅，切换拍法并创建具体地点计划可用。
- 数据库 schemaVersion仍为1，新增为JSON可选字段，无破坏性迁移。旧旅行工程保留旧配方；新版 real-place-six / 2.0.0。
- 固定 McGrox / gpt-image-2.5-sunburst。生成、参考契约、多图验收开关均false，每日上限0，未注入密钥。真实模型请求0，本轮模型费用0；不表示后续单价或单次成本为0。
- 未验证：奶蛙准确形象、真人身份一致性、地标准确性、角色融合、餐厅内装与多参考编辑契约、真实费用。未授权上传真人／角色到模型，不进行真实调用。无支付接入。
- 线上健康 database=ok、worker=online；三项站点服务active；检查时preview错误级日志无条目。HTTP临时数据均已清理，浏览器验收空项目仅按本次确定ID清理。
- 证据目录 .scratch/delivery-evidence，desktop-home-qjb-places-v8.png、mobile-plan-qjb-places-v8.png（全页截图曾在图片加载前捕获，不作为视觉验收证据）。

## 部署与回滚

- SSH cizong-hermes-1802；current=/var/www/zsm-photo-shoot/current → releases/qjb-places-v8。
- preview web:4196，zsm-shoot-web 与 zsm-shoot-worker；原站4195及 zsm-photo-studio 未改。数据 /var/lib/zsm-photo-shoot，SQLite WAL 与非公开文件，服务用户zsm-shoot。
- 备份 /var/backups/zsm-photo-shoot/qjb-places-v8，含preview-release.before、web.before、worker.before、nginx.before；上一版本qjb-places-v7。
- 回滚时先确认无active生成任务，将current指回preview-release.before中的v7，恢复两份unit，systemctl daemon-reload并仅重启zsm-shoot-web/zsm-shoot-worker，检查health版本。保留数据库与照片，不删用户数据；无需改动nginx。若回到改版前v5，使用qjb-places-v6备份中的before指针和unit。
- 发布脚本 scripts/deploy-shoot-preview.sh 拒绝覆盖同名release，下一次更新需新release ID。部署前保存当前版本，先构建成功再切换。

下一阶段只做「本人＋奶蛙＋外滩」获授权真实试拍，具体执行提示词见 docs/prompts/04-beta-and-launch.md。

---

# 六镜旅行写真：当前运行与验收记录

复测发现并修复：改计划旧结果误计6/6、选旧版却修改最新版、手机审片操作被挤出屏幕、保存过程中继续输入可能丢改动、只改名也触发新一套拍摄。一次本地HTTP测试被共享合成请求计数上限中止；调整仅限本地fake provider测试额度后通过，线上生成开关和0请求上限未改变。

证据文件：.scratch/delivery-evidence/desktop-home-qjb-six-v5.png、mobile-plan-qjb-six-v5.png；mobile-compare-v5-synthetic.png仅为本地纯色工程图片。本次线上临时验收项目均已清理；未向线上注入合成成片。真实生成、本人认可和陌生用户可用性仍未验证。

验收：第一轮74测试通过并浏览器验证导航；第二轮补改名回归后75测试通过。最终Linux生产构建通过；本地HTTP验证含合成六镜、修改版本、按计划ZIP与对应计划清单；线上HTTP验证含跨会话404、CSRF403、坏图拒绝、参考移除/过期版本409、生成503、旧API410及真实web/worker重启恢复。390px手机未横向溢出，线上浏览器无error记录。断网自动保存失败留在原页，联网后再次离开能保存；大图切片、版本选择、Esc与修改焦点已实测。

第二轮：独立六镜构图示意、加大正文与操作字号、左侧参考/右侧编辑、手机底部保存栏；原比例大图审片、方向键切片、Esc返回焦点、选定原版与实际父版本对比、直达评价修改、原图加载/失败/重试。修改提交明确携带所选原片ID并在后端校验。项目编辑revision与拍摄planRevision分开，单独改名不消耗拍摄进度；改变场景、画幅或参考才建立新计划。

第一轮：视图写入URL，刷新与浏览器前后退恢复步骤；站内离开先保存，失败留在编辑页并保留草稿。身份与构图参考可单独移除；无任务使用过的替换文件回收，历史任务引用保留。作品、续拍、ZIP按拍摄计划版本分组，禁止旧片冒充新计划已完成。

## 本次追加两轮迭代（v5）

更新：2026-10-07（Asia/Shanghai）。以下优先于本文件后面的历史 Mock 实验说明。

## 当前交付边界

- 新版隔离预览：https://zsm.cauai.fun/studio-next/studio 。版本 qjb-six-v5。
- 原 https://zsm.cauai.fun/studio 保留旧版本 20261004-040900，未被替换。
- 当前用户可创建项目、私密上传参考、选择方向和实际画幅、精调六镜、保存并重新打开计划。生成保持关闭，不收款。
- 六镜结果、原版/修改版、人工评价、单图与ZIP下载、受控恢复已实现并以合成测试图片验证；真人质量未验收。
- 首屏是项目既有山野概念图，不是本次真人输出；不新增虚构样片、评价或使用人数。

## 架构及边界

- Node 22.23.2（服务器），Next 16.3.7；内置 SQLite WAL + 私有磁盘 + 独立 worker。
- 服务：zsm-shoot-web（127.0.0.1:4196）、zsm-shoot-worker。以独立系统用户 zsm-shoot 运行，不使用 root 运行网站。
- 当前 release：/var/www/zsm-photo-shoot/current → /var/www/zsm-photo-shoot/releases/qjb-six-v5。
- 数据：/var/lib/zsm-photo-shoot；不在 public 或 release 内。目录0700、资产0600、服务UMask0077；session cookie 为 HttpOnly/Secure/SameSite=Strict，项目按cookie哈希隔离。
- 数据 schemaVersion=1；planRevision为兼容性新增JSON字段，旧记录读取时回退revision，无批量迁移。本次没有迁移旧站数据库或删除旧站资料。SQLite依赖单机文件系统，当前不支持多服务器并行部署。
- 单人六镜配方1.0.0；身份参考与封面构图参考职责独立；普通用户不依赖3D。结构化画幅映射为1024x1536、1536x1024、1024x1024，并检查实际输出尺寸。
- 任务与逐次调用持久化。重复请求key幂等；一次只有一个活动任务；上游不确定或进程中断记recoverable，不自动重发；已完成镜头立即保存。停止只阻止后续镜头，不保证取消已提交请求或计费。
- 项目保留30天；worker按小时清理到期项目，活动任务除外。当前最大20项目/会话、6参考/项目、8MB/上传、12任务/项目；全站资产默认硬上限2GiB。删除资产失败进入持久化清理表再处理。
- 匿名身份目前绑定浏览器Cookie，清除Cookie或换设备不能恢复；不是账号系统。不把浏览器存储当数据库。未建设离机灾备，不能把单机持久化称为永久保存。
- 成本记录包含每次尝试与状态、耗时、用量和费用来源；未核实账单时金额为null。人工分钟数和正式渠道对账目前仍须实验记录，不冒充自动完成。

## 能力开关与费用

STUDIO_GENERATION_ENABLED=false、STUDIO_REFERENCE_CONTRACT_VERIFIED=false、STUDIO_MULTI_REFERENCE_VERIFIED=false、STUDIO_DAILY_REQUEST_LIMIT=0。预览服务器未注入图像密钥。

供应商固定McGrox，完整模型gpt-image-2.5-sunburst。OPENAI_API_KEY和OPENAI_BASE_URL只从授权的服务端配置在内存读取；不打印、不提交、不传到前端、不改写域名。

截至本次核查，渠道公开文档仅给出images/generations文字生图示例；无法据此确认images/edits、image/image[]、quality、尺寸与base64响应。provider中的参考编辑适配器受验收开关保护，是待验证契约。单价与渠道素材保留政策未知，不启用生成或宣传人物一致性。

本次真实图片模型调用0次，新增模型费用0；未上传真人照片至模型渠道。未新增付费基础设施，现有服务器固定成本未重新核算。没有确认支付商户条件，因此没有接收款。

## 工程证据

- 15个测试文件，75项测试通过；包括新系统与渠道适配器单元测试。上游响应由测试函数提供，未发送网络图片请求。
- TypeScript通过；ESLint无错误，保留2条旧导演台组件img警告。
- Linux服务器生产构建通过。生产依赖npm audit为0漏洞；开发工具依赖仍有5项high，不能用强制降Next解决，发布包不依赖这些开发工具处理请求。
- scripts/shoot-smoke.mjs：真实HTTP验证创建/保存/重读、坏图片拒绝与恢复、私有上传、CSRF、跨会话404、生成503关闭、旧API410、测试项目删除。仅当SMOKE_ORIGIN为localhost且显式给SMOKE_DATA_DIR时，才可向独立测试库注入纯色结果，验证六镜保存、ZIP内容一致和评价。
- 浏览器验收：桌面与390px手机布局、计划保存和刷新、六镜规格、未开放提示、断网草稿保留与重试；真实陌生用户观察和真实成片仍未进行。
- 最终版本BUILD_ID：q2InMToXV5MFOp5dMYD9l。线上实际重启web与worker后，计划和参考图片字节仍保持一致；旧/studio继续HTTP 200。
- 线上日志未见请求异常或敏感内容。主动重启时Next进程退出143被systemd记为exit-code，随后立即成功启动；当前三项服务active。SQLite仍有实验性提示。SQLite实验性运行时提示仍存在，需随Node升级复核。

## 发布、健康与回滚

部署脚本：scripts/deploy-shoot-preview.sh。只修改本站Nginx的/studio-next路径，旧站继续4195；ACME和其他站点配置保持原状。预览响应带noindex。

检查：GET /studio-next/api/shoot/health；版本、database=ok、worker=online、generation=false必须同时核对。检查systemctl is-active zsm-shoot-web zsm-shoot-worker zsm-photo-studio。

最终发布备份目录：/var/backups/zsm-photo-shoot/qjb-six-v5，含发布前Nginx、两份preview服务unit、前一版preview路径、旧正式版本路径。私有数据独立保留。

只回退新版代码（先核对当前仍为qjb-six-v5）：将/var/www/zsm-photo-shoot/current指向已保存qjb-six-v4；恢复上述备份中的web.before和worker.before到各自systemd unit；systemctl daemon-reload后只重启zsm-shoot-web和zsm-shoot-worker；再检查health。数据库schema1兼容，不删数据。旧正式站不需要回退。

如要彻底撤下预览，先检查Nginx没有其他人后续修改，再按最初qjb-six-v1/nginx.before恢复本站配置，nginx -t通过后reload，仅停止两个preview服务；不要递归删除数据或release。回滚路径和备份已保存，未为演练额外切回旧代码。

## 下一阶段唯一重点

核实真实参考编辑契约，然后完成获授权的六镜组照、单张修改和封面构图A/B，记录所有失败及合格片总成本。执行提示词在docs/prompts/04-beta-and-launch.md。未经真人与渠道验收，不能替换正式/studio或宣称可收费交付。

---

## 历史记录：旧Mock阶段（不代表当前新版）

# 首批用户实验运行手册

## 实验目的

验证“旅行情侣写真”是否能让真实用户完成一次创作、获得可接受的结果，并愿意发布或推荐。当前目标是收集真实反馈，不是宣称正式商业上线。

## 测试对象

- 10～20 名熟悉小红书或经常拍照的用户。
- 优先选择情侣、旅行内容创作者、穿搭分享者和摄影爱好者。
- 不要求收集真实姓名、手机号、身份证或社交账号。

## 测试步骤

1. 先展示三个模板和已有样片/概念说明。
2. 让用户选择一个模板，不主动解释导演台细节。
3. 用户可选择一张参考照进行本地预览；明确说明当前不会上传参考照。
4. 让用户在快速模式提交 Mock 体验订单。
5. 记录用户完成一次提交所需时间、是否需要帮助和首次反馈。
6. 如要做真实 OpenLux 验收，必须另行获得一次明确费用授权；只提交一个镜头，不带参考照，不自动重试。
7. 生成完成后让用户填写满意度、发布意愿、推荐意愿和一句话反馈。
8. 每完成 5～10 个订单导出一次匿名实验记录。
9. 结束测试后删除本地参考照片和下载的临时文件。

## 记录内容

记录以下指标：

- 模板选择；
- 快速/专家模式；
- Mock 或 OpenLux；
- 从创建订单到结果完成的时间；
- 是否产生输出；
- 失败类别和是否重试；
- 满意度 1～5 分；
- 是否愿意发布；
- 是否愿意推荐；
- 用户原话。

不要记录原始照片、图片 URL、Base64、完整提示词、导演快照或用户身份信息。

## 通过标准

- Mock 订单成功率 ≥ 95%；
- 真实图片（获得授权后）成功率目标 ≥ 85%；
- 首次结果时间目标 ≤ 10 分钟；
- 满意度平均分 ≥ 3.5/5；
- 小红书发布意愿 ≥ 20%；
- 推荐意愿 ≥ 10%。

## 决策规则

- 生成成功率低于 85%：暂停扩张，先修交付链。
- 平均耗时超过 10 分钟：优化请求规格、重试策略和人工兜底。
- 满意度低于 3.5：停止增加场景，先重做模板审美。
- 发布意愿低于 20%：重新检查成片是否真的适合小红书。
- 20 个有效订单后仍无人愿意付费或预订：重新审视定位，不继续堆技术功能。
- 某个模板明显领先：集中资源打磨领先模板，而不是平均扩展。

## 当前限制

- 订单仅保存在当前浏览器会话；刷新后可能丢失。
- 当前未接支付、账号、云端存储和社媒发布。
- OpenLux 的参考图、批量数量、长期 URL、取消、轮询和正式报价仍未确认。
- Mock 结果不是 AI 成片，不能作为真实质量证据。
