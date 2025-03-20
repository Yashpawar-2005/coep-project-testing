import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Database, FileCode, Check } from 'lucide-react';
import { api } from '@/services/axios';
import { useParams } from 'react-router-dom';
// import { useToast } from '@/components/ui/use-toast';

const SqlSubmissionForm = ({admindata}) => {
  const { id } = useParams();
//   const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: 'query', 
    title: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a title."
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        progress: [{
          type: formData.type,
          title: formData.title,
          description: formData.description,
          content: admindata
        }]
      };
      await api.post(`/submit_to_admin/${id}`, payload);
      setSuccess(true);
      alert({
        title: "Submission successful",
        description: "Your contribution has been sent to the admin for review.",
        variant: "default"
      });
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          type: 'query',
          title: '',
          description: ''
        });
        setOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting:', error);
      alert({
        variant: "destructive",
        title: "Submission failed",
        description: error.response?.data?.message || "There was an error sending your contribution."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-2 py-2 h-auto rounded-lg hover:bg-gray-900 transition-colors text-gray-300 hover:text-white"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-900 text-purple-400">
            <Send size={16} />
          </div>
          <span className="ml-3 text-sm font-medium truncate">Send to Admin</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px] bg-gray-950 text-gray-200 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Submit Contribution</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new query or schema to submit for admin review.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="query" className="w-full" onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <TabsList className="grid grid-cols-2 mb-4 bg-gray-900">
            <TabsTrigger value="query" className="flex items-center gap-2 data-[state=active]:bg-gray-800">
              <FileCode size={16} />
              Query
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2 data-[state=active]:bg-gray-800">
              <Database size={16} />
              Schema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="mt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Title</Label>
                <Input 
                  id="title" 
                  name="title"
                  placeholder="Optimized Product Search Query" 
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-800 text-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Improved search performance by adding indexes" 
                  value={formData.description}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-800 text-gray-200"
                />
              </div>
            </form>
          </TabsContent>

          <TabsContent value="schema" className="mt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="schema-title" className="text-gray-300">Title</Label>
                <Input 
                  id="schema-title" 
                  name="title"
                  placeholder="User Authentication Schema" 
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-800 text-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schema-description" className="text-gray-300">Description</Label>
                <Input
                  id="schema-description"
                  name="description"
                  placeholder="Added user authentication tables with proper relations" 
                  value={formData.description}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-800 text-gray-200"
                />
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {success ? (
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Check className="mr-2 h-4 w-4" /> Submitted Successfully
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={submitting} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? "Submitting..." : "Submit to Admin"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Modified version of your Send to Admin button that uses the dialog component
const SendToAdminButton = ({admindata}) => {
  return <SqlSubmissionForm admindata={admindata} />;
};

export default SendToAdminButton;