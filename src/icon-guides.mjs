// Curated guidance only: entries without an editorial guide keep their dialog.
export const iconGuidePath = (locale, id) => `discover/${locale}/icons/${id}/`;
export const iconGuides = {
  kubernetes: {
    reference: 'https://kubernetes.io/docs/concepts/overview/',
    en: {
      summary: 'Kubernetes manages containerized workloads. Use its icon to identify a cluster or orchestration platform in a draw.io architecture diagram.',
      diagram: 'Place the logo on the cluster boundary and label the cluster name or environment. Draw workloads, nodes, networking and storage inside that boundary with their own labels; the Kubernetes logo alone does not distinguish those resources.',
      tip: 'For an autoscaling diagram, pair Kubernetes with Karpenter and label the node-provisioning relationship. For monitoring, show Grafana outside or inside the cluster according to your actual deployment.',
    },
    'zh-CN': {
      summary: 'Kubernetes 用于管理容器化工作负载。在 draw.io 架构图中，可以用它的图标标识集群或容器编排平台。',
      diagram: '建议把标志放在集群边界旁，并标注集群名称或环境。边界内部的工作负载、节点、网络和存储应分别命名；单个 Kubernetes 标志无法表达这些资源之间的区别。',
      tip: '绘制自动扩缩容架构时，可搭配 Karpenter 并标注节点配置关系。绘制监控架构时，按实际部署位置将 Grafana 放在集群内部或外部。',
    }, related: ['karpenter', 'grafana'],
  },
  karpenter: {
    reference: 'https://karpenter.sh/docs/',
    en: {
      summary: 'Karpenter provisions Kubernetes nodes for workload demand. Its icon is useful in diagrams explaining how cluster capacity is created and managed.',
      diagram: 'Represent Karpenter as a controller connected to the cluster and the infrastructure provider. Label NodePools and the nodes they govern separately, so readers can distinguish the controller from the compute capacity it manages.',
      tip: 'In an AWS deployment diagram, show the relationship to EC2 capacity explicitly. Avoid using the Karpenter logo as a generic replacement for a Kubernetes node or for application replica scaling.',
    },
    'zh-CN': {
      summary: 'Karpenter 根据工作负载需求配置 Kubernetes 节点。它的图标适合用于说明集群计算容量如何创建和管理。',
      diagram: '建议将 Karpenter 表示为连接集群与基础设施提供方的控制器。分别标注 NodePool 和受其管理的节点，让读者能区分控制器与计算容量。',
      tip: '在 AWS 部署图中，明确画出与 EC2 容量的关系。不要把 Karpenter 标志当成普通 Kubernetes 节点或应用副本扩缩容的通用图标。',
    }, related: ['kubernetes'],
  },
  keycloak: {
    reference: 'https://www.keycloak.org/',
    en: {
      summary: 'Keycloak provides identity and access management, including single sign-on and support for OpenID Connect and SAML. Use its icon to identify the identity service in an authentication diagram.',
      diagram: 'Draw the user or browser, application and Keycloak as distinct participants. Label authentication redirects and token-related connections with the protocol your application actually uses. Show an external identity provider or directory only when your deployment includes one.',
      tip: 'In a Kubernetes-hosted setup, place Keycloak inside the cluster boundary but keep its identity role visible. The logo identifies the software; label realms or separate instances explicitly when they matter to the design.',
    },
    'zh-CN': {
      summary: 'Keycloak 提供身份与访问管理、单点登录，并支持 OpenID Connect 和 SAML。可以用它的图标标识认证架构中的身份服务。',
      diagram: '把用户或浏览器、应用与 Keycloak 画成独立参与方。认证跳转和令牌相关连接应标注实际采用的协议；只有部署确实包含外部身份提供商或目录时才加入这些组件。',
      tip: '如果 Keycloak 部署在 Kubernetes 内，可将它放进集群边界，但应明确其身份服务职责。标志只标识软件；当 Realm 或多个实例影响设计时，请单独标注。',
    }, related: ['kubernetes'],
  },
  grafana: {
    reference: 'https://grafana.com/docs/grafana/latest/introduction/',
    en: {
      summary: 'Grafana queries and visualizes data from connected sources. Its icon can identify the dashboard and exploration layer in an observability diagram.',
      diagram: 'Separate Grafana from the systems that collect and store telemetry. Label each data source and draw query relationships to it. This avoids suggesting that the Grafana dashboard itself stores all metrics, logs or traces.',
      tip: 'For Kubernetes monitoring, distinguish the monitored cluster, telemetry backends and Grafana. Label a hosted service or self-managed instance according to what is actually deployed; the artwork alone does not identify the hosting model.',
    },
    'zh-CN': {
      summary: 'Grafana 可以查询和可视化所连接数据源中的数据。它的图标适合标识可观测性架构中的仪表盘与数据探索层。',
      diagram: '将 Grafana 与遥测数据的采集、存储系统分开绘制。标注各数据源以及查询关系，避免让读者误以为 Grafana 仪表盘本身存储了全部指标、日志和链路数据。',
      tip: '绘制 Kubernetes 监控图时，区分被监控集群、遥测后端与 Grafana。按实际部署标注托管服务或自建实例；单凭标志无法区分托管方式。',
    }, related: ['kubernetes'],
  },
};
