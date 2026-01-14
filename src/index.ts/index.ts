export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("Hello from thriftysouq Worker!", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
};
