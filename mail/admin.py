from django.contrib import admin
from .models import *

# Register your models here.
class Emails(admin.ModelAdmin):
    list_display = ("id", "user", "sender","subject","body", "timestamp", "read","archived")
    list_editable = ("user", "sender","subject","body", "read","archived")


admin.site.register(Email, Emails)
