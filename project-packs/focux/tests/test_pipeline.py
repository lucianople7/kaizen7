"""Real media E2E; synthetic content explicitly remains unacceptable for release."""
import json
import os
from pathlib import Path
import unittest
import uuid
from PIL import Image
from focux.core import Factory, read, write, FocuxError, project_lock

class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.root=Path(__file__).parent/'.runs'/uuid.uuid4().hex
        self.f=Factory(self.root)
        Image.new('RGB',(200,100),'gold').save(self.root/'library/brand/logo.png')
        self.f.create('Tokyo After Dark',project_id='SIGNAL-003')

    def test_contact_sheet_cannot_reach_ffmpeg(self):
        self.f.assets_generate('SIGNAL-003',fixture=True)
        p=self.f.path('SIGNAL-003');manifest=read(p/'asset-manifest.json')
        manifest['assets'][0]['provenance']['source_kind']='contact_sheet'
        write(p/'asset-manifest.json',manifest)
        with self.assertRaises(FocuxError):self.f.render('SIGNAL-003')
        self.assertFalse((p/'SIGNAL-003.mp4').exists())

    def test_full_real_render_gate_critique_learning(self):
        self.f.assets_generate('SIGNAL-003',fixture=True)
        self.assertTrue(self.f.assets_validate('SIGNAL-003')['pass'])
        result=self.f.render('SIGNAL-003')
        self.assertTrue(result['technical_pass'])
        self.assertTrue(result['fixture'])
        qa=self.f.critique('SIGNAL-003')
        self.assertFalse(qa['production_ready'])
        self.assertEqual(len(qa['gates']['gates']),18)
        self.assertFalse(qa['gates']['failures'],qa['gates'])
        self.f.learn('SIGNAL-003')
        self.assertFalse(self.f.learning_report()['improvement_proven'])
        self.assertEqual(len(self.f.library_search('tokyo night')),9)
        self.assertTrue(self.f.audit()['pass'])

    def test_mutations_are_exclusive(self):
        with project_lock(self.f.path('SIGNAL-003')):
            with self.assertRaises(FocuxError): self.f.assets_generate('SIGNAL-003',fixture=True)

    def test_agent_feedback_not_human_evidence(self):
        self.f.feedback('SIGNAL-003',score=10,actor='mcp_agent')
        self.assertEqual(self.f.feedback_for('SIGNAL-003'),[])
        with self.assertRaises(FocuxError):self.f.feedback('SIGNAL-003',approve=True,actor='mcp_agent')

if __name__=='__main__':unittest.main()
