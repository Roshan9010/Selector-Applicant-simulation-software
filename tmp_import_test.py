import importlib,traceback,sys

try:
    importlib.import_module('backend.main')
    print('IMPORT_OK')
except Exception:
    traceback.print_exc()
    sys.exit(1)
