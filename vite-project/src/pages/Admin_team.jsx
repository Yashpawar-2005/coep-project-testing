import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Code, Database, FileCode, BookOpen, History, Download } from 'lucide-react';
import { api } from '@/services/axios';
import { useParams } from 'react-router-dom';
import "../App.css"
import SchemaResponses from '@/compo/Schema';
const SQLContributionsAdmin = () => {
  const { id } = useParams();
  // State for contributions
  const [contributions, setContributions] = useState([]);
  const [mainCodebase, setMainCodebase] = useState({
    schemas: [],
    queries: [],
    combinedSchema: "", // Combined schema from backend
    combinedQueries: "" // Combined queries from backend
  });
  
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await api(`/team/get_all_teams/${id}`);
        console.log(response.data.data.teamcode.pendingcodes);
        setContributions(response.data.data.teamcode.pendingcodes);
        
        // Fetch main codebase (accepted contributions)
        const { data } = await api.get(`/team/get_main_codebase/${id}`);

        // Update main codebase in state
        setMainCodebase({
          schemas: data.schemas || [],
          queries: data.queries || [],
          combinedSchema: data.combinedSchema || "",
          combinedQueries: data.combinedQueries || "",
        });
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };
    
    if (id) {
      fetchTeamData();
    }
  }, [id]);
  
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [mainCodeTab, setMainCodeTab] = useState("schemas");
  const [selectedMainCode, setSelectedMainCode] = useState(null);

  // Function to handle accepting a contribution
  const handleAccept = async (contributionId) => {
    try {
      // Approve the contribution
      await api.post("/admin/approve_submission", {
        pendingcodeId: contributionId,
      });
  
      // Update local state after approval
      setContributions((prevContributions) =>
        prevContributions.map((contrib) =>
          contrib.id === contributionId
            ? { ...contrib, ispending: false }
            : contrib
        )
      );
  
      // Refresh the main codebase
      const { data } = await api.get(`/team/get_main_codebase/${id}`);
  
      // Update main codebase in state
      setMainCodebase({
        schemas: data.schemas || [],
        queries: data.queries || [],
        combinedSchema: data.combinedSchema || "",
        combinedQueries: data.combinedQueries || "",
      });
  
      console.log(`Contribution ${contributionId} approved.`);
    } catch (error) {
      console.error("Error accepting contribution:", error);
    }
  };
  

  // Function to view a contribution
  const viewContribution = (contribution) => {
    setSelectedContribution(contribution);
    setSelectedMainCode(null); // Clear main code selection
  };
  
  // Function to view a main code item
  const viewMainCode = (codeItem) => {
    setSelectedMainCode(codeItem);
    setSelectedContribution(null); // Clear contribution selection
  };

  // Filter contributions based on active tab
  const filteredContributions = contributions.filter(contrib => {
    if (activeTab === "all") return true;
    if (activeTab === "schema" || activeTab === "query") {
      return contrib.type.toLowerCase() === activeTab;
    }
    if (activeTab === "pending") return contrib.ispending === true;
    if (activeTab === "accepted") return contrib.ispending === false;
    return true;
  });

  // Parse JSON from content string
  const parseContent = (contentString) => {
    try {
      return JSON.parse(contentString);
    } catch (error) {
      console.error("Error parsing content:", error);
      return [];
    }
  };
  
  // Handle downloading the main codebase
  const handleDownload = () => {
    const content = JSON.stringify(mainCodebase, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sql-main-codebase.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SQL Contributions Management</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
            <Database size={14} />
            {contributions.filter(c => c.type.toLowerCase() === "schema").length} Schemas
          </Badge>
          <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
            <FileCode size={14} />
            {contributions.filter(c => c.type.toLowerCase() === "query").length} Queries
          </Badge>
        </div>
      </div>
      
      {/* Contributions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-h-[90vh] overflow-y-scroll scrollbar-hide">
        <div className="md:col-span-1">
          <Card  className="max-h-[90vh] overflow-y-scroll scrollbar-hide">
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
                  <Card 
                    key={contribution.id} 
                    className={`cursor-pointer ${selectedContribution?.id === contribution.id ? 'ring-2 ring-primary' : ''}`} 
                    onClick={() => viewContribution(contribution)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {contribution.type.toLowerCase() === "schema" ? <Database size={16} /> : <FileCode size={16} />}
                            <h3 className="font-medium">{contribution.title}</h3>
                          </div>
                          <p className="text-sm text-gray-500">By {contribution.user?.name || 'Unknown'}</p>
                        </div>
                        <Badge variant={contribution.ispending === false ? "success" : "outline"}>
                          {contribution.ispending === false ? "Accepted" : "Pending"}
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
            <Card className="max-h-[90vh] overflow-y-scroll scrollbar-hide">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      {selectedContribution.type.toLowerCase() === "schema" ? 
                        <Badge variant="outline" className="px-2 py-1 flex items-center gap-1"><Database size={14} /> Schema</Badge> : 
                        <Badge variant="outline" className="px-2 py-1 flex items-center gap-1"><FileCode size={14} /> Query</Badge>
                      }
                      <CardTitle>{selectedContribution.title}</CardTitle>
                    </div>
                    <CardDescription>{selectedContribution.description}</CardDescription>
                    <CardDescription className="mt-1">
                      Submitted by {selectedContribution.user?.name || 'Unknown'} on {new Date(selectedContribution.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {selectedContribution.ispending === true && (
                    <Button 
                      onClick={() => handleAccept(selectedContribution.id)} 
                      className="flex items-center gap-2"
                    >
                      <Check size={16} /> Accept & Execute
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
                      {parseContent(selectedContribution.content).map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="bg-gray-100 p-4 rounded-md">
                            <p className="font-medium text-gray-800">Requirement:</p>
                            <p>{item.prompt}</p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-md">
                            <p className="font-medium text-gray-200 mb-2">
                              SQL {selectedContribution.type.toLowerCase() === "schema" ? "Schema" : "Query"}:
                            </p>
                            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
                              {item.responce}
                            </pre>
                          </div>
                        </div>
                      ))}
                      {parseContent(selectedContribution.content).length === 0 && (
                        <div className="text-center p-6 text-gray-500">
                          No content available for this contribution
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="code" className="mt-4">
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                      {selectedContribution.content}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-gray-50">
                <div className="text-sm text-gray-500">
                  {selectedContribution.type.toLowerCase() === "schema" ? 
                    "This schema will modify database structure" : 
                    "This query will be available in the query library"
                  }
                </div>
                {selectedContribution.ispending === false ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check size={16} /> Accepted
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => handleAccept(selectedContribution.id)}
                  >
                    <Check size={16} /> Accept & Execute
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : selectedMainCode ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      {selectedMainCode.type?.toLowerCase() === "schema" ? 
                        <Badge variant="outline" className="px-2 py-1 flex items-center gap-1"><Database size={14} /> Schema</Badge> : 
                        <Badge variant="outline" className="px-2 py-1 flex items-center gap-1"><FileCode size={14} /> Query</Badge>
                      }
                      <CardTitle>{selectedMainCode.title}</CardTitle>
                    </div>
                    <CardDescription>{selectedMainCode.description}</CardDescription>
                    <CardDescription className="mt-1">
                      Added on {new Date(selectedMainCode.addedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 p-4 rounded-md">
                  <p className="font-medium text-gray-200 mb-2">
                    SQL {selectedMainCode.type?.toLowerCase() === "schema" ? "Schema" : "Query"}:
                  </p>
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
                    {selectedMainCode.content}
                  </pre>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-gray-50">
                <div className="text-sm text-gray-500">
                  {selectedMainCode.type?.toLowerCase() === "schema" ? 
                    "This schema is part of the main database structure" : 
                    "This query is available in the main query library"
                  }
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={16} /> Active
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center p-12">
                <Database size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a SQL contribution or main code item to preview</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Main Codebase Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Main SQL Codebase</h2>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleDownload}>
            <Download size={16} /> Export Codebase
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} /> Complete Codebase View
                </CardTitle>
                <CardDescription>
                  Consolidated view of all accepted SQL components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="combined">
                  <TabsList>
                    <TabsTrigger value="combined">Combined View</TabsTrigger>
                    <TabsTrigger value="schemas">Schemas</TabsTrigger>
                    <TabsTrigger value="queries">Queries</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="combined" className="mt-4">
                    <div className="space-y-6">
                      <div className="bg-gray-100 p-4 rounded-md">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <Database size={16} /> Database Schemas
                        </h3>
                        {mainCodebase.combinedSchema ? (
                          <div className="bg-gray-900 p-4 rounded-md">
                            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
                              {mainCodebase.combinedSchema}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-gray-500">No schemas available</p>
                        )}
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded-md">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <FileCode size={16} /> SQL Queries
                        </h3>
                        {mainCodebase.combinedQueries ? (
                          <div className="bg-gray-900 p-4 rounded-md">
                            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
                              {mainCodebase.combinedQueries}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-gray-500">No queries available</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="schemas" className="mt-4">
                    <div className="space-y-4">
                      {mainCodebase.schemas.length > 0 ? (
                        mainCodebase.schemas.map((schema, index) => (
                          <div key={schema.id || index} className="bg-gray-100 p-4 rounded-md">
                            <h3 className="font-medium mb-2">{schema.title || `Schema ${index + 1}`}</h3>
                            <div className="bg-gray-900 p-4 rounded-md">
                              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
                                <SchemaResponses schemas={JSON.parse(schema.content)}/>
                              </pre>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-6 text-gray-500">
                          No schemas available in the main codebase
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="queries" className="mt-4">
                    <div className="space-y-4">
                      {mainCodebase.queries.length > 0 ? (
                        mainCodebase.queries.map((query, index) => (
                          <div key={query.id || index} className="bg-gray-100 p-4 rounded-md">
                            <h3 className="font-medium mb-2">{query.title || `Query ${index + 1}`}</h3>
                            <div className="bg-gray-900 p-4 rounded-md">
                              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
                              <SchemaResponses schemas={JSON.parse(query.content)}/>
                              </pre>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-6 text-gray-500">
                          No queries available in the main codebase
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <div className="text-sm text-gray-500 w-full flex justify-between items-center">
                  <span>
                    Total: {mainCodebase.schemas.length} schemas, {mainCodebase.queries.length} queries
                  </span>
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleDownload}>
                    <Download size={14} /> Export Codebase
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLContributionsAdmin;