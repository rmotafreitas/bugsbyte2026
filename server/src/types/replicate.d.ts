declare module "replicate" {
  interface ReplicateOptions { auth?: string }
  class Replicate {
    constructor(options?: ReplicateOptions)
    run(model: string, input: any): Promise<any>
  }
  export default Replicate
}
