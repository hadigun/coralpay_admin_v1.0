import React, { useState } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export interface RouterConfig {
  variable: string;
  cases: { value: string; target: string }[];
  default: string;
}

interface RouterPluginProps {
  initialConfig?: RouterConfig;
  onSave: (pluginName: string, config: RouterConfig) => void;
}

const RouterPlugin: React.FC<RouterPluginProps> = ({ initialConfig, onSave }) => {
  const [config, setConfig] = useState<RouterConfig>(initialConfig || { variable: '', cases: [], default: '' });

  const handleCaseChange = (index: number, field: keyof (typeof config.cases)[0], value: string) => {
    const newCases = [...config.cases];
    newCases[index][field] = value;
    setConfig({ ...config, cases: newCases });
  };

  const addCase = () => {
    setConfig({ ...config, cases: [...config.cases, { value: '', target: '' }] });
  };

  const removeCase = (index: number) => {
    const newCases = [...config.cases];
    newCases.splice(index, 1);
    setConfig({ ...config, cases: newCases });
  };

  return (
    <div className="mt-4 p-4 border rounded-md bg-gray-50">
      <h5 className="text-lg font-semibold mb-4">Router Plugin Configuration</h5>
      <div className="mb-4">
        <Label htmlFor="variable">Context Variable:</Label>
        <Input 
          id="variable"
          type="text" 
          value={config.variable}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, variable: e.target.value })}
          className="mt-1"
        />
      </div>

      <h6 className="text-md font-medium mb-2">Cases:</h6>
      {config.cases.map((caseItem, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <Input 
            type="text" 
            placeholder="Value" 
            value={caseItem.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCaseChange(index, 'value', e.target.value)}
            className="flex-1"
          />
          <Input 
            type="text" 
            placeholder="Target Node ID" 
            value={caseItem.target}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCaseChange(index, 'target', e.target.value)}
            className="flex-1"
          />
          <Button variant="destructive" size="sm" onClick={() => removeCase(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={addCase} className="mb-4">Add Case</Button>

      <div className="mb-4">
        <Label htmlFor="defaultTarget">Default Target Node ID:</Label>
        <Input 
          id="defaultTarget"
          type="text" 
          value={config.default}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, default: e.target.value })}
          className="mt-1"
        />
      </div>
      <Button onClick={() => onSave('router', config)} className="w-full">Save Config</Button>
    </div>
  );
};

export default RouterPlugin;