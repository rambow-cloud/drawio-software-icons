// Every catalog entry has a dynamic detail URL; editorial copy is optional.
export const iconSiteUrl = 'https://icons.rambow.cloud/';
export const iconGuidePath = (locale, id) => `discover/${locale}/icons/${encodeURIComponent(id)}/`;
export const iconDetailUrl = (locale, id) => new URL(iconGuidePath(locale, id), iconSiteUrl).href;
// Only these pages existed as static documents on the Pages mirrors.
export const legacyStaticIconIds = ['kubernetes', 'karpenter', 'keycloak', 'grafana'];
export const iconGuides = {
  kubernetes: {
    en: {
      summary: 'Kubernetes manages containerized workloads. Use its icon to identify a cluster or orchestration platform in a draw.io architecture diagram.',
    },
    'zh-CN': {
      summary: 'Kubernetes 用于管理容器化工作负载。在 draw.io 架构图中，可以用它的图标标识集群或容器编排平台。',
    }, related: ['karpenter', 'grafana'],
  },
  karpenter: {
    en: {
      summary: 'Karpenter provisions Kubernetes nodes for workload demand. Its icon is useful in diagrams explaining how cluster capacity is created and managed.',
    },
    'zh-CN': {
      summary: 'Karpenter 根据工作负载需求配置 Kubernetes 节点。它的图标适合用于说明集群计算容量如何创建和管理。',
    }, related: ['kubernetes'],
  },
  keycloak: {
    en: {
      summary: 'Keycloak provides identity and access management, including single sign-on and support for OpenID Connect and SAML. Use its icon to identify the identity service in an authentication diagram.',
    },
    'zh-CN': {
      summary: 'Keycloak 提供身份与访问管理、单点登录，并支持 OpenID Connect 和 SAML。可以用它的图标标识认证架构中的身份服务。',
    }, related: ['kubernetes'],
  },
  grafana: {
    en: {
      summary: 'Grafana queries and visualizes data from connected sources. Its icon can identify the dashboard and exploration layer in an observability diagram.',
    },
    'zh-CN': {
      summary: 'Grafana 可以查询和可视化所连接数据源中的数据。它的图标适合标识可观测性架构中的仪表盘与数据探索层。',
    }, related: ['kubernetes'],
  },
};
