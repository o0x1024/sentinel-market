# 云安全入口

## 先确定测试视角

公网可见资产、用户提供的策略/配置、授权云身份、自建隔离环境是不同视角。只有公网访问条件时，不能宣称完成 IAM、KMS、集群 RBAC 或网络隔离审计。云账号、订阅/项目、区域和资源标识应独立匹配 [授权](../scope-and-rules.md)。

| 线索 | 下一步文档 | 所需前提 |
|---|---|---|
| 存储、数据库、备份、函数暴露 | [云配置](cloud-misconfiguration.md) | 具体资源与访问/配置规则 |
| 身份、策略、信任、凭据位置 | [云 IAM](cloud-iam.md) | 获准身份或只读策略材料 |
| 镜像、容器、API、RBAC | [容器与 K8s](container-k8s-security.md) | 对应工作负载/集群及测试权限 |
| URL 导入与元数据线索 | [SSRF](../by-type/ssrf.md) | 入口及目的地/动作的授权 |

## 确认原则

把公网可达、配置偏离基线、权限过宽与可利用漏洞分别记录。安全基线可以支持加固建议，不能自动证明实际边界突破。云元数据地址、鉴权方式、对象存储访问规则依厂商和版本不同，查相应官方文档，不套用一个路径到所有云。

独立实验环境上证明的链条标为实验复现，不能推断目标环境具备同等权限；在实际授权目标上使用自建样例证明的边界按其真实证据评估。默认最小实验不包含生产凭据使用、云持久化、信任修改、资源创建计费或内部横向操作。当前任务明确允许创建/清理测试夹具时，仅按 [云配置](cloud-misconfiguration.md) 的指定命名空间、非敏感样例、费用及清理约束执行；此例外不授权其他动作。必要条件缺失可交付待确认线索。

## 资料来源

按目标实际厂商/版本读取官方资料并记录链接和核对日期：[AWS 安全文档](https://docs.aws.amazon.com/security/)、[Azure 安全](https://learn.microsoft.com/en-us/azure/security/)、[Google Cloud 安全](https://cloud.google.com/security)、[阿里云文档](https://help.aliyun.com/)、[Kubernetes 安全](https://kubernetes.io/docs/concepts/security/)。

[OWASP Kubernetes Top Ten](https://owasp.org/www-project-kubernetes-top-ten/) 与 [MITRE Cloud Matrix](https://attack.mitre.org/matrices/enterprise/cloud/) 可辅助覆盖分类；战术编号不充当严重等级，也不构成测试动作许可。
