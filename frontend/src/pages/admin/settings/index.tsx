//@ts-nocheck
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import api from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  model: z.string({
    required_error: "Please select an LLM model.",
  }),
  apiKey: z.string().min(1, "API key is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
});

function AdminPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "",
      apiKey: "",
      systemPrompt: "",
    },
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await api.get("/settings");
        if (response.data.success) {
          form.setValue("model", response.data.settings.model);
          form.setValue("apiKey", response.data.settings.apiKey);
          form.setValue("systemPrompt", response.data.settings.systemPrompt);
          setModels(response.data.models);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await api.post("/settings/update", values);
    console.log(response.data);

    toast({
      title: "Settings saved",
      description: `Model: ${values.model}, API Key: ${values.apiKey.substring(
        0,
        4
      )}...`,
    });
  }

  return (
    <div className="container py-10">
      {loading ? (
        <div className="flex justify-center items-center h-7/12">
          <Loader2Icon className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>LLM Configuration</CardTitle>
            <CardDescription>
              Configure your preferred LLM model and API key settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LLM Model</FormLabel>
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select model..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the LLM model you want to use for your
                        application.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OpenAI API Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="sk-..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your API key will be securely stored and used for model
                        requests.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="systemPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Prompt</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a custom system prompt for the LLM.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Your API key is stored securely and never shared with third parties.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default AdminPage;
