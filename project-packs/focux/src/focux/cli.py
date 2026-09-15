"""The single FOCUX command. JSON schema v1; no shell command interpolation."""
import argparse
import json
import os
from pathlib import Path
import shutil
import sys
from .core import Factory, FocuxError

class Parser(argparse.ArgumentParser):
    def error(self,message): raise FocuxError(message)

def doctor(factory):
    tools={n:os.environ.get('FOCUX_'+n.upper()) or shutil.which(n) for n in ['ffmpeg','ffprobe']}
    checks={n:bool(p and Path(p).is_file()) for n,p in tools.items()}
    return {'pass':all(checks.values()),'tools':tools,'checks':checks,'factory_id':factory.status()['factory_id'],'live_generation':'not_configured','external_actions':'disabled'}

def main(argv=None):
    argv=list(sys.argv[1:] if argv is None else argv)
    machine='--json' in argv
    argv=[a for a in argv if a!='--json']
    root=os.environ.get('FOCUX_HOME',str(Path.cwd()/'focux-data'))
    try:
        if '--root' in argv:
            i=argv.index('--root')
            if i+1==len(argv): raise FocuxError('--root requires a directory')
            root=argv[i+1];del argv[i:i+2]
        p=Parser(prog='focux',description='THE FOCUX local audiovisual factory. Every command supports --json and --root PATH.')
        subs=p.add_subparsers(dest='cmd',required=True)
        for name in ['status','doctor']:subs.add_parser(name)
        create=subs.add_parser('create');create.add_argument('title');create.add_argument('--id',dest='project_id')
        project=subs.add_parser('project').add_subparsers(dest='operation',required=True)
        project.add_parser('show').add_argument('project_id')
        library=subs.add_parser('library').add_subparsers(dest='operation',required=True)
        library.add_parser('search').add_argument('query')
        library.add_parser('inspect').add_argument('asset_id')
        assets=subs.add_parser('assets').add_subparsers(dest='operation',required=True)
        gen=assets.add_parser('generate');gen.add_argument('project_id');gen.add_argument('--fixture',action='store_true')
        assets.add_parser('validate').add_argument('project_id')
        imp=assets.add_parser('import');imp.add_argument('project_id');imp.add_argument('--manifest',required=True);imp.add_argument('--audio',required=True)
        for name in ['storyboard','render','critique','learn']:subs.add_parser(name).add_argument('project_id')
        f=subs.add_parser('feedback');f.add_argument('project_id');f.add_argument('--score',type=float);f.add_argument('--note');f.add_argument('--approve',action='store_true')
        subs.add_parser('learning').add_subparsers(dest='operation',required=True).add_parser('report')
        subs.add_parser('lessons').add_subparsers(dest='operation',required=True).add_parser('list')
        ex=subs.add_parser('experiments').add_subparsers(dest='operation',required=True);ex.add_parser('list')
        ex.add_parser('promote').add_argument('experiment_id')
        ec=ex.add_parser('create');ec.add_argument('--hypothesis',required=True);ec.add_argument('--variable',required=True,choices=['brand_prominence','manga_max']);ec.add_argument('--challenger',required=True);ec.add_argument('--context',required=True)
        ea=ex.add_parser('assign');ea.add_argument('experiment_id');ea.add_argument('project_id');ea.add_argument('--arm',required=True,choices=['champion','challenger'])
        er=ex.add_parser('run');er.add_argument('experiment_id');er.add_argument('--champion',required=True);er.add_argument('--challenger',required=True)
        policy=subs.add_parser('policy').add_subparsers(dest='operation',required=True);policy.add_parser('show');policy.add_parser('rollback').add_argument('version');policy.add_parser('diff').add_argument('experiment_id')
        mcp=subs.add_parser('mcp').add_subparsers(dest='operation',required=True);mcp.add_parser('serve');mcp.add_parser('doctor')
        args=p.parse_args(argv);fac=Factory(root)
        if args.cmd=='status':result=fac.status()
        elif args.cmd=='doctor':result=doctor(fac)
        elif args.cmd=='create':result=fac.create(args.title,args.project_id)
        elif args.cmd=='project':result=fac.project_get(args.project_id)
        elif args.cmd=='library':result=fac.library_search(args.query) if args.operation=='search' else fac.library_inspect(args.asset_id)
        elif args.cmd=='assets':
            if args.operation=='generate':result=fac.assets_generate(args.project_id,args.fixture)
            elif args.operation=='import':result=fac.assets_import(args.project_id,args.manifest,args.audio)
            else:result=fac.assets_validate(args.project_id)
        elif args.cmd=='feedback':result=fac.feedback(args.project_id,args.score,args.note,args.approve)
        elif args.cmd in ['storyboard','render','critique','learn']:result=getattr(fac,args.cmd)(args.project_id)
        elif args.cmd in ['learning','lessons']:result=fac.learning_report()
        elif args.cmd=='experiments':
            from .learning import create_experiment,record_pair
            if args.operation=='list':result=fac.experiments()
            elif args.operation=='create':result=create_experiment(fac,args.hypothesis,args.variable,int(args.challenger) if args.variable=='manga_max' else float(args.challenger),args.context)
            elif args.operation=='assign':result=fac.experiment_assign(args.project_id,args.experiment_id,args.arm)
            elif args.operation=='run':result=record_pair(fac,args.experiment_id,args.champion,args.challenger)
            else:result=fac.promote(args.experiment_id)
        elif args.cmd=='policy':
            if args.operation=='show':result=fac.policy()
            elif args.operation=='diff':
                from .learning import _experiment
                exp=_experiment(fac,args.experiment_id);result={'changed_variables':exp['changed_variables'],'champion':exp['champion_policy'],'challenger':exp['challenger_policy']}
            else:result=fac.policy_rollback(args.version)
        elif args.cmd=='mcp':
            from .bridge import build_server, mcp_doctor
            if args.operation=='serve':build_server(fac).run(transport='stdio');return 0
            result=mcp_doctor(fac)
        exit_code=6 if isinstance(result,dict) and result.get('pass') is False else 0
        output={'schema_version':1,'ok':exit_code==0,'result':result}
    except FocuxError as e:
        exit_code=e.exit_code;output={'schema_version':1,'ok':False,'error':{'code':e.code,'message':str(e)}}
    except (OSError,ValueError,RuntimeError,ImportError) as e:
        exit_code=7;output={'schema_version':1,'ok':False,'error':{'code':'operation_failed','message':str(e)}}
    print(json.dumps(output,ensure_ascii=False,allow_nan=False,indent=None if machine else 2))
    return exit_code
