from django.core.files.uploadhandler import FileUploadHandler
from django.core.files.uploadedfile import TemporaryUploadedFile

class CustomUploadHandler(FileUploadHandler):
    def __init__(self, request=None):
        super().__init__(request)
        self.file = None

    def new_file(self, field_name, file_name, content_type, content_length, charset=None, content_type_extra=None):
        self.file = TemporaryUploadedFile(file_name, content_type, 0, charset, content_type_extra)

    def receive_data_chunk(self, raw_data, start):
        self.file.write(raw_data)
        return raw_data

    def file_complete(self, file_size):
        self.file.seek(0)
        return self.file
