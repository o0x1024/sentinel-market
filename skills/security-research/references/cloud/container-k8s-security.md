# 容器与 Kubernetes

## 适用信号与前提

容器配置、镜像材料、API Server/kubelet/dashboard、RBAC、挂载和 NetworkPolicy。先确定可用视角：外部 API、授权只读身份、用户提供配置或自建集群；缺少内部身份不等于完成内部审计。

## 最小实验

- 镜像/配置：仅分析已提供或获准下载的材料，记录版本、权限、危险挂载及凭据位置；不自动拉取私有镜像。
- API：用获准身份或匿名请求访问指定非敏感测试资源，记录响应语义与授权结果；不枚举所有命名空间、Secret 或执行容器命令。
- RBAC：分析实际绑定、规则与身份，必要时用允许的权限自查/测试资源读取确认；不要修改角色验证。
- 网络隔离：使用已授权测试工作负载及预期隔离关系。缺少 NetworkPolicy 是线索，不能独立证明跨租户可达。

## 确认与反例

`--anonymous-auth=true` 表示接受匿名身份，不等于该身份拥有敏感权限；仍需有效授权规则与实际资源访问证据。[Kubernetes 官方说明](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#anonymous-requests)。健康端点可匿名访问不直接构成漏洞。

特权配置、docker.sock、可写宿主挂载是风险线索；是否可利用取决于已有权限与实际环境。Secret 的编码表示不能代替对存储加密和访问控制的判断。公网 API、版本信息或默认错误响应不能证明集群接管。

## 下一步、停止与报告

逃逸/提权机制研究仅在自建隔离环境；不在目标创建特权 Pod、挂载宿主、修改 RBAC、读取 Secret 或持久化。明确区分配置审计与目标动态验证。

报告记录组件/版本、预期边界、身份/资源、有效配置与访问结果、修复方向和限制。遵守 [验证](../verification.md)。

## 调研补充：有效权限的证据

记录主体、namespace、resource/subresource 与 verb；RoleBinding 引用 ClusterRole 仍可能只授予某 namespace 的权限，不能仅按角色名认定全局权限。匿名认证与 RBAC 授权分开，健康端点公开不证明可读 Secret 或可 exec。用授权策略/测试资源核对具体能力；不从特权配置线索直接宣布容器逃逸。

## 调研来源

- [K8S-rbac · Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [K8S-anon · Anonymous requests](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#anonymous-requests)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。
