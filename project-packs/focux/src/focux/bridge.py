"""Official MCP SDK adapter. Same Factory service; stdio has no public listener."""
import asyncio
import json
import os
import sys
from .core import Factory

def build_server(factory: Factory):
    from mcp.server import MCPServer
    from mcp.types import ToolAnnotations
    server=MCPServer('THE FOCUX')
    read_only=ToolAnnotations(read_only_hint=True,destructive_hint=False,open_world_hint=False)
    local=ToolAnnotations(read_only_hint=False,destructive_hint=False,open_world_hint=False)
    @server.tool(annotations=read_only)
    def focux_status()->dict:
        """Inspect real local factory identity, projects and audit chain."""
        return factory.status()
    @server.tool(annotations=local)
    def focux_create(title:str)->dict:
        """Create local production planning files; does not generate paid media."""
        return factory.create(title)
    @server.tool(annotations=read_only)
    def focux_project_get(project_id:str)->dict:
        """Read the current project and exact creative context hash."""
        return factory.project_get(project_id)
    @server.tool(annotations=read_only)
    def focux_library_search(query:str)->dict:
        """Search local asset metadata before requesting new generation."""
        return {'assets':factory.library_search(query)}
    @server.tool(annotations=read_only)
    def focux_library_inspect(asset_id:str)->dict:
        """Inspect provenance and current file integrity."""
        return factory.library_inspect(asset_id)
    @server.tool(annotations=local)
    def focux_assets_generate(project_id:str,fixture:bool=False)->dict:
        """Generate explicit local test fixtures. Live generation remains blocked."""
        return factory.assets_generate(project_id,fixture)
    @server.tool(annotations=local)
    def focux_assets_validate(project_id:str)->dict:
        """Validate physical production masters; append evidence to local audit."""
        return factory.assets_validate(project_id)
    @server.tool(annotations=local)
    def focux_storyboard(project_id:str)->dict:
        """Prepare planning-only storyboard after independent master validation."""
        return factory.storyboard(project_id)
    @server.tool(annotations=local)
    def focux_render(project_id:str)->dict:
        """Render a local video with FFmpeg after fail-closed asset gates."""
        return factory.render(project_id)
    @server.tool(annotations=local)
    def focux_critique(project_id:str)->dict:
        """Evaluate technical gates; visual judgement remains explicit pending review."""
        return factory.critique(project_id)
    @server.tool(annotations=local)
    def focux_feedback(project_id:str,score:float|None=None,note:str|None=None)->dict:
        """Record agent feedback only. Cannot impersonate human approval or authorize spend."""
        return factory.feedback(project_id,score,note,actor='mcp_agent')
    @server.tool(annotations=local)
    def focux_learn(project_id:str)->dict:
        """Record evidence-backed observations and bounded experiment proposal."""
        return factory.learn(project_id)
    @server.tool(annotations=read_only)
    def focux_learning_report()->dict:
        """Inspect samples, uncertainty, proposals and active policy."""
        return factory.learning_report()
    @server.resource('focux://status')
    def status_resource()->str:return json.dumps(factory.status())
    @server.resource('focux://projects/{project_id}')
    def project_resource(project_id:str)->str:return json.dumps(factory.project_get(project_id))
    return server

async def _doctor(factory):
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client
    params=StdioServerParameters(command=sys.executable,args=['-m','focux','--root',str(factory.root),'mcp','serve'],env={k:v for k,v in os.environ.items() if k in ['PATH','PYTHONPATH','SYSTEMROOT','TEMP','TMP','FOCUX_FFMPEG','FOCUX_FFPROBE']})
    async with stdio_client(params) as (reader,writer):
        async with ClientSession(reader,writer) as session:
            await session.initialize()
            tools=await session.list_tools()
            result=await session.call_tool('focux_status',{})
            data=result.structured_content
            if not data:
                data=json.loads(next(c.text for c in result.content if hasattr(c,'text')))
            expected=factory.status()['factory_id']
            return {'pass':data['factory_id']==expected,'factory_id':data['factory_id'],'tool_count':len(tools.tools),'transport':'stdio','proof':'Actual SDK initialize/list_tools/call_tool roundtrip against same SQLite identity','chatgpt_connected':False}

def mcp_doctor(factory):
    # Anonymous subprocess pipes also work in Windows hosts that prohibit the
    # overlapped named pipes used by asyncio subprocess creation.
    import subprocess
    import threading
    import queue
    messages=queue.Queue()
    env={k:v for k,v in os.environ.items() if k in ['PATH','PYTHONPATH','SYSTEMROOT','TEMP','TMP','FOCUX_FFMPEG','FOCUX_FFPROBE']}
    process=subprocess.Popen([sys.executable,'-m','focux','--root',str(factory.root),'mcp','serve'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,env=env)
    errors=[]
    def collect():
        for line in process.stdout: messages.put(line)
    def collect_errors():
        for line in process.stderr: errors.append(line)
    threading.Thread(target=collect,daemon=True).start()
    threading.Thread(target=collect_errors,daemon=True).start()
    def send(method,params,id=None):
        value={'jsonrpc':'2.0','method':method,'params':params}
        if id is not None:value['id']=id
        process.stdin.write(json.dumps(value)+'\n');process.stdin.flush()
        if id is None:return None
        for _ in range(30):
            response=json.loads(messages.get(timeout=15))
            if response.get('id')==id:
                if 'error' in response:raise RuntimeError(str(response['error']))
                return response['result']
        raise RuntimeError('No matching MCP response')
    try:
        send('initialize',{'protocolVersion':'2025-11-25','capabilities':{},'clientInfo':{'name':'focux-doctor','version':'1.0'}},1)
        send('notifications/initialized',{})
        tools=send('tools/list',{},2)
        result=send('tools/call',{'name':'focux_status','arguments':{}},3)
        if result.get('isError'):raise RuntimeError(str(result))
        data=result.get('structuredContent') or json.loads(next(c['text'] for c in result['content'] if c['type']=='text'))
        return {'pass':data['factory_id']==factory.status()['factory_id'],'factory_id':data['factory_id'],'tool_count':len(tools['tools']),'transport':'stdio','proof':'Live JSON-RPC initialize/list_tools/call_tool against official SDK server and same SQLite identity','chatgpt_connected':False}
    except queue.Empty:
        raise RuntimeError('MCP server did not respond: '+''.join(errors)[-1500:])
    finally:
        process.terminate()
        try:process.wait(timeout=5)
        except subprocess.TimeoutExpired:process.kill();process.wait()
        for pipe in [process.stdin,process.stdout,process.stderr]:pipe.close()
