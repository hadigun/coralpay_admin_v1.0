import { INPUT_TOOL_TYPES, PLUGIN_TOOL_TYPES } from "@/constants/tools";
import type {
  InputToolType,
  NodeData,
  NodeType,
  Plugin,
  PluginToolType,
  ToolType,
} from "@/types";

import type {
  ApiCallPlugin,
  PaymentPlugin,
  RouterPlugin,
  ValidationPlugin,
} from "@mobiresoft-coral/ussd-shared-core";

import { getId } from "./utils";

export function createApiPlugin(): ApiCallPlugin {
  return {
    id: crypto.randomUUID(),
    toolType: "plugin_apicall",
    type: "api_call",
    order: 0,
    config: {
      url: "",
      method: "GET",
      headers: {},
      queryParams: {},
    },
  };
}

export function createPaymentPlugin(): PaymentPlugin {
  return {
    id: crypto.randomUUID(),
    toolType: "plugin_payment",
    type: "payment",
    order: 0,
    config: {
      endTemplate: "",
      amount: "",
    },
  };
}

export function createRouterPlugin(): RouterPlugin {
  return {
    id: crypto.randomUUID(),
    toolType: "plugin_router",
    type: "router",
    order: 0,
    config: {
      routes: [{ id: getId(), condition: "", input: "" }],
      defaultRoute: "",
      errorRoute: "",
    },
  };
}
export function createValidationPlugin(
  toolType: ToolType,
  regexp: string = "",
  isNumeric: boolean = false
): ValidationPlugin {
  return {
    id: crypto.randomUUID(),
    toolType,
    type: "validation",
    order: 0,
    config: {
      inputKey: "",
      regexp,
      isNumeric,
      outputKey: "",
      message: "Invalid input",
    },
  };
}

export function createEmailInputPlugin(): ValidationPlugin {
  return createValidationPlugin(
    "input_email",
    "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    false
  );
}

export function createPhoneInputPlugin(): ValidationPlugin {
  return createValidationPlugin("input_phone", "^[0-9]{10}$", true);
}

export function createWebsiteInputPlugin(): ValidationPlugin {
  return createValidationPlugin(
    "input_website",
    "^(https?:\\/\\/)?([\\w.-]+)\\.([a-z]{2,})([\\/\\w.-]*)*\\/?$",
    false
  );
}

export function createNumberInputPlugin(): ValidationPlugin {
  return createValidationPlugin("input_number", "^[0-9]+$", true);
}

export function createTextInputPlugin(): ValidationPlugin {
  return createValidationPlugin("input_text", ".*", false);
}

export function isPluginOrInputTool(
  tool: unknown
): tool is PluginToolType | InputToolType {
  return (
    PLUGIN_TOOL_TYPES.includes(tool as PluginToolType) ||
    INPUT_TOOL_TYPES.includes(tool as InputToolType)
  );
}

interface CreateNodeDataParams {
  name: string;
  type: NodeType;
  postPlugins?: Plugin[];
  prePlugins?: Plugin[];
  supportsPlugins?: boolean;
  renderTemplate?: string;
}

export function createNodeData({
  name,
  type,
  postPlugins = [],
  prePlugins = [],
  renderTemplate = "",
}: CreateNodeDataParams): NodeData {
  return {
    name,
    type,
    postPlugins,
    prePlugins,
    renderTemplate,
    id: getId(),
    meta: {},
  };
}
