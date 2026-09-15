import json
import os
from pathlib import Path
import subprocess
import sys
import unittest
import uuid
import threading
import queue

class InterfacesTests(unittest.TestCase):
    def setUp(self):
        self.root=Path(__file__).parent/'.runs'/uuid.uuid4().hex
        self.root.mkdir(parents=True)
    def cli(self,*args):
        return subprocess.run([sys.executable,'-m','focux','--root',str(self.root),*args],capture_output=True,text=True,timeout=30)
    def test_json_everywhere_and_real_files(self):
        result=self.cli('create','Tokyo After Dark','--json')
        self.assertEqual(result.returncode,0,result.stderr)
        result=json.loads(result.stdout)
        self.assertEqual(result['result']['id'],'SIGNAL-001')
        status=json.loads(self.cli('--json','status').stdout)
        self.assertTrue(status['result']['factory_id'])
        self.assertEqual(len(status['result']['projects']),1)
    def test_errors_machine_readable_no_paid_call(self):
        self.cli('create','Tokyo')
        result=self.cli('assets','generate','SIGNAL-001','--json')
        self.assertEqual(result.returncode,5)
        self.assertEqual(json.loads(result.stdout)['error']['code'],'approval_required')
        result=self.cli('wat','--json')
        self.assertEqual(result.returncode,2)
        self.assertFalse(json.loads(result.stdout)['ok'])
    def test_stdio_doctor_real_roundtrip(self):
        result=self.cli('mcp','doctor','--json')
        self.assertEqual(result.returncode,0,result.stderr+result.stdout)
        data=json.loads(result.stdout)['result']
        self.assertTrue(data['pass'])
        self.assertGreaterEqual(data['tool_count'],13)
        self.assertEqual(data['factory_id'],json.loads(self.cli('status','--json').stdout)['result']['factory_id'])

    def test_mcp_create_is_visible_to_cli_and_cannot_approve(self):
        process=subprocess.Popen([sys.executable,'-m','focux','--root',str(self.root),'mcp','serve'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True)
        q=queue.Queue()
        def reader():
            for line in process.stdout:q.put(json.loads(line))
        threading.Thread(target=reader,daemon=True).start()
        def send(id,method,params):
            msg={'jsonrpc':'2.0','method':method,'params':params}
            if id is not None:msg['id']=id
            process.stdin.write(json.dumps(msg)+'\n');process.stdin.flush()
            if id is not None:
                while True:
                    value=q.get(timeout=15)
                    if value.get('id')==id:return value
        try:
            send(1,'initialize',{'protocolVersion':'2025-11-25','capabilities':{},'clientInfo':{'name':'integration-test','version':'1'}})
            send(None,'notifications/initialized',{})
            result=send(2,'tools/call',{'name':'focux_create','arguments':{'title':'MCP real production'}})
            self.assertNotIn('error',result)
            data=json.loads(self.cli('project','show','SIGNAL-001','--json').stdout)['result']
            self.assertEqual(data['brief']['title'],'MCP real production')
            send(3,'tools/call',{'name':'focux_feedback','arguments':{'project_id':'SIGNAL-001','score':10,'approve':True}})
            from focux.core import Factory
            self.assertEqual(Factory(self.root).feedback_for('SIGNAL-001'),[])
        finally:
            process.terminate();process.wait(timeout=5);process.stdin.close();process.stdout.close()

if __name__=='__main__':unittest.main()
