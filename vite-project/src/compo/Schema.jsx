import React from 'react';

const SchemaResponses = ({ schemas }) => {
  return (
    <div className="space-y-6 bg-black">
      {schemas.map((item, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">Schema {index + 1}</h3>
          <div className="bg-gray-900 p-4 rounded-md">
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
              {item.responce ? item.responce.replace(/<think>[\s\S]*?<\/think>/g, '') : item.response ? item.response.replace(/<think>[\s\S]*?<\/think>/g, '') : ''}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchemaResponses;