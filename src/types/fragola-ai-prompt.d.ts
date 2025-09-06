declare module '@fragola-ai/prompt' {
  interface PromptOptions {
    [key: string]: any;
  }

  class Prompt {
    constructor(template?: string, options?: PromptOptions);
    
    // Add more specific method signatures based on how you use the library
    render(data?: Record<string, any>): string;
    load(path: string): Promise<Prompt>;
    static load(path: string): Promise<Prompt>;
  }

  export default Prompt;
  export { Prompt, PromptOptions };
}
