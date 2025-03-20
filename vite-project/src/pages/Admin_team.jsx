  import React, { useState,useEffect } from 'react';
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import { Badge } from '@/components/ui/badge';
  import { Check, Eye, Code, GitMerge, Database, FileCode } from 'lucide-react';
import { api } from '@/services/axios';
import { useParams } from 'react-router-dom';

  const SQLContributionsAdmin = () => {
    const {id}=useParams()
    // Sample data - in a real app, this would come from an API
    const [contributions, setContributions] = useState([
      {
        id: 1,
        author: "dbmaster",
        title: "User Authentication Schema",
        description: "Added user authentication tables with proper relations",
        status: "pending",
        createdAt: "2025-03-18T14:30:00",
        type: "schema",
        content: [
          {
            "prompt": "Create a schema for user authentication with roles", 
            "responce": "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  username VARCHAR(50) UNIQUE NOT NULL,\n  email VARCHAR(100) UNIQUE NOT NULL,\n  password_hash VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE roles (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(50) UNIQUE NOT NULL,\n  description TEXT\n);\n\nCREATE TABLE user_roles (\n  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,\n  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,\n  PRIMARY KEY (user_id, role_id)\n);"
          }
        ]
      },
      {
        id: 2,
        author: "queryoptimizer",
        title: "Optimized Product Search Query",
        description: "Improved search performance by adding indexes and optimizing JOIN conditions",
        status: "pending",
        createdAt: "2025-03-19T09:15:00",
        type: "query",
        content: [
          {
            "prompt": "Optimize product search with category filtering", 
            "responce": "-- Original query\nSELECT p.*, c.name as category_name\nFROM products p\nJOIN categories c ON p.category_id = c.id\nWHERE p.name LIKE '%searchterm%'\nORDER BY p.created_at DESC;\n\n-- Optimized query\nSELECT p.*, c.name as category_name\nFROM products p\nINNER JOIN categories c ON p.category_id = c.id\nWHERE p.name ILIKE '%searchterm%'\nORDER BY p.created_at DESC\nLIMIT 100;\n\n-- Add index for performance\nCREATE INDEX idx_products_name ON products USING gin(name gin_trgm_ops);\nCREATE INDEX idx_products_created_at ON products(created_at);"
          }
        ]
      },
      {
        id: 3,
        author: "schemadesigner",
        title: "E-commerce Database Schema",
        description: "Complete schema for e-commerce platform with orders, products, and customers",
        status: "pending",
        createdAt: "2025-03-17T11:45:00",
        type: "schema",
        content: [
          {
            "prompt": "Design a normalized schema for an e-commerce database", 
            "responce": "CREATE TABLE customers (\n  customer_id SERIAL PRIMARY KEY,\n  first_name VARCHAR(50) NOT NULL,\n  last_name VARCHAR(50) NOT NULL,\n  email VARCHAR(100) UNIQUE NOT NULL,\n  phone VARCHAR(20),\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE products (\n  product_id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  description TEXT,\n  price DECIMAL(10,2) NOT NULL,\n  inventory_count INTEGER NOT NULL DEFAULT 0,\n  category_id INTEGER REFERENCES categories(category_id)\n);\n\nCREATE TABLE orders (\n  order_id SERIAL PRIMARY KEY,\n  customer_id INTEGER REFERENCES customers(customer_id),\n  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  status VARCHAR(20) NOT NULL,\n  total_amount DECIMAL(10,2) NOT NULL\n);\n\nCREATE TABLE order_items (\n  order_id INTEGER REFERENCES orders(order_id),\n  product_id INTEGER REFERENCES products(product_id),\n  quantity INTEGER NOT NULL,\n  unit_price DECIMAL(10,2) NOT NULL,\n  PRIMARY KEY (order_id, product_id)\n);"
          }
        ]
      }
    ]);
    useEffect(() => {
      const myfunct=async () => {
        const data=await api(`/team/get_all_teams/${id}`)
        console.log(data)
      }
      if(id){
        myfunct()
      }
    }, [id])
    
    const [selectedContribution, setSelectedContribution] = useState(null);
    const [activeTab, setActiveTab] = useState("all");

    // Function to handle accepting a contribution
    const handleAccept =async (id) => {
      setContributions(contributions.map(contrib => 
        contrib.id === id ? {...contrib, status: "accepted"} : contrib
      ));
      
      
      // In a real application, you would make an API call here to merge the SQL into the database
      console.log(`SQL Contribution ${id} accepted and merged into main database`);
    };

    // Function to view a contribution
    const viewContribution = (contribution) => {
      setSelectedContribution(contribution);
    };

    // Filter contributions based on active tab
    const filteredContributions = contributions.filter(contrib => {
      if (activeTab === "all") return true;
      if (activeTab === "schema" || activeTab === "query") return contrib.type === activeTab;
      return contrib.status === activeTab;
    });

    // Function to syntax highlight SQL (simple version - in production you might use a library)
    const highlightSQL = (sql) => {
      return sql;
    };

    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">SQL Contributions Management</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
              <Database size={14} />
              {contributions.filter(c => c.type === "schema").length} Schemas
            </Badge>
            <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
              <FileCode size={14} />
              {contributions.filter(c => c.type === "query").length} Queries
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>SQL Contributions</CardTitle>
                <CardDescription>Review and manage SQL schemas and queries</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="schema">Schemas</TabsTrigger>
                    <TabsTrigger value="query">Queries</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="accepted">Accepted</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="mt-4 space-y-3">
                  {filteredContributions.map((contribution) => (
                    <Card key={contribution.id} className={`cursor-pointer ${selectedContribution?.id === contribution.id ? 'ring-2 ring-primary' : ''}`} onClick={() => viewContribution(contribution)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              {contribution.type === "schema" ? <Database size={16} /> : <FileCode size={16} />}
                              <h3 className="font-medium">{contribution.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500">By {contribution.author}</p>
                          </div>
                          <Badge variant={contribution.status === "accepted" ? "success" : "outline"}>
                            {contribution.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            {selectedContribution ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedContribution.type === "schema" ? 
                          <Badge variant="outline" className="px-2 py-1 flex items-center gap-1"><Database size={14} /> Schema</Badge> : 
                          <Badge variant="outline" className="px-2 py-1 flex items-center gap-1"><FileCode size={14} /> Query</Badge>
                        }
                        <CardTitle>{selectedContribution.title}</CardTitle>
                      </div>
                      <CardDescription>{selectedContribution.description}</CardDescription>
                      <CardDescription className="mt-1">Submitted by {selectedContribution.author} on {new Date(selectedContribution.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    {selectedContribution.status === "pending" && (
                      <Button 
                        onClick={() => handleAccept(selectedContribution.id)} 
                        className="flex items-center gap-2"
                      >
                        <GitMerge size={16} /> Accept & Execute
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="preview">
                    <TabsList>
                      <TabsTrigger value="preview" className="flex items-center gap-2"><Eye size={16} /> SQL Preview</TabsTrigger>
                      <TabsTrigger value="code" className="flex items-center gap-2"><Code size={16} /> Raw JSON</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preview" className="mt-4">
                      <div className="space-y-6">
                        {selectedContribution.content.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="bg-gray-100 p-4 rounded-md">
                              <p className="font-medium text-gray-800">Requirement:</p>
                              <p>{item.prompt}</p>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-md">
                              <p className="font-medium text-gray-200 mb-2">SQL {selectedContribution.type === "schema" ? "Schema" : "Query"}:</p>
                              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
                                {item.responce}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="code" className="mt-4">
                      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                        {JSON.stringify(selectedContribution.content, null, 2)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-gray-50">
                  <div className="text-sm text-gray-500">
                    {selectedContribution.type === "schema" ? 
                      "This schema will modify database structure" : 
                      "This query will be available in the query library"
                    }
                  </div>
                  {selectedContribution.status === "accepted" ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check size={16} /> Accepted
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => handleAccept(selectedContribution.id)}
                    >
                      <GitMerge size={16} /> Accept & Execute
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center p-12">
                  <Database size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Select a SQL contribution to preview</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default SQLContributionsAdmin;