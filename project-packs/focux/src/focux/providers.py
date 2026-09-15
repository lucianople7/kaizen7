"""Image generation boundaries. The default is an explicitly synthetic fixture."""
from abc import ABC, abstractmethod
import hashlib
import json
from pathlib import Path
import random
import shutil
from PIL import Image, ImageDraw


class ImageProvider(ABC):
    name = 'abstract'
    fixture = False

    @abstractmethod
    def generate(self, request: dict, output_path: Path) -> dict:
        """Write exactly one independent master and return provenance."""


class FixtureImageProvider(ImageProvider):
    name = 'synthetic-fixture-v1'
    fixture = True

    def generate(self, request, output_path):
        seed = int(hashlib.sha256(json.dumps({'shot': request['shot'], 'world': request.get('world_bible', {})}, sort_keys=True).encode()).hexdigest()[:16], 16)
        rng = random.Random(seed)
        image = Image.new('RGB', (960, 540), tuple(rng.randint(15, 65) for _ in range(3)))
        draw = ImageDraw.Draw(image)
        # Independently constructed abstract scenes, deliberately not photoreal.
        for _ in range(28):
            x, y = rng.randrange(960), rng.randrange(480)
            color = tuple(rng.randint(50, 230) for _ in range(3))
            if rng.random() > .5:
                draw.rectangle((x, y, min(x + rng.randrange(30, 240), 959), min(y + rng.randrange(30, 200), 500)), fill=color)
            else:
                radius = rng.randrange(15, 110)
                draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=color)
        draw.rectangle((0, 508, 960, 540), fill='black')
        draw.text((16, 518), 'SYNTHETIC TEST FIXTURE / INDEPENDENT SHOT ' + request['shot']['id'], fill='white')
        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(output_path)
        return {'source_kind': 'independent_master', 'root_source_id': 'fixture:' + str(seed),
                'fixture': True, 'description': 'Synthetic procedural fixture, not production photography'}


class GPTImageProvider(ImageProvider):
    """Reserved interface only: real transport/approval authority is not implemented."""
    name = 'gpt-image'

    def __init__(self, *, approval=None, transport=None):
        self.approval = approval
        self.transport = transport
        self.spent = 0.0

    def generate(self, request, output_path):
        raise PermissionError('Live GPT image generation is disabled. No real transport or trusted approval authority is implemented. An approval dictionary cannot authorize spending.')


class LocalImageProvider(ImageProvider):
    """Import locally supplied independent images; never claims to generate them."""
    name = 'local-independent-image-v1'

    def __init__(self, source_manifest: Path):
        self.source_manifest = Path(source_manifest).resolve()
        raw = self.source_manifest.read_bytes()
        rows = json.loads(raw)['assets']
        self.sources = {str(row['shot_id']): row for row in rows}
        if len(self.sources) != len(rows):
            raise ValueError('Duplicate source shot id')
        self.fixture = any(row.get('provenance', {}).get('fixture', False) for row in rows)
        self.cache_key = hashlib.sha256(raw).hexdigest()

    def generate(self, request, output_path):
        row = self.sources.get(str(request['shot']['id']))
        if row is None:
            raise ValueError('Missing local source for requested shot')
        source = (self.source_manifest.parent / row['path']).resolve()
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if digest != row.get('sha256'):
            raise ValueError('Local source hash missing or changed')
        provenance = dict(row.get('provenance', {}))
        if provenance.get('source_kind') != 'independent_master' or not provenance.get('root_source_id') or not provenance.get('description'):
            raise ValueError('Local image needs independent source provenance')
        if any(word in json.dumps(provenance).lower() for word in ('contact_sheet', 'contact sheet', 'storyboard', 'crop')):
            raise ValueError('Contact-sheet/storyboard/crop sources are prohibited')
        with Image.open(source) as image:
            if image.format not in ('PNG', 'JPEG', 'WEBP') or min(image.size) < 256:
                raise ValueError('Invalid local image format/dimensions')
            image.verify()
        output_path = Path(output_path)
        if source == output_path.resolve():
            raise ValueError('Local original cannot be overwritten')
        output_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, output_path)
        provenance.update({'source_path': str(source), 'source_sha256': digest,
                           'import_kind': 'local_original', 'anchor_request': request.get('anchor_paths', []),
                           'continuity_review': 'required: local import does not establish that anchors were followed'})
        return provenance


class MotionProvider(ABC):
    @abstractmethod
    def generate(self, master_path: Path, request: dict, output_path: Path) -> dict:
        """Future image-to-video boundary; no production implementation supplied."""
