from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User, Group
from .models import Category, Product, PackedLunch


# --- CUSTOMIZAÇÃO DE USUÁRIOS E GRUPOS ---
class CustomUserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'get_groups']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'groups']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering = ['-date_joined']
    
    def get_groups(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])
    get_groups.short_description = 'Groups'

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_permissions_count']
    search_fields = ['name']
    filter_horizontal = ['permissions']
    
    def get_permissions_count(self, obj):
        return obj.permissions.count()
    get_permissions_count.short_description = 'Number of Permissions'


admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)


# --- GERENCIAMENTO DO CARDÁPIO ---
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

class VariacaoInline(admin.TabularInline):
    model = PackedLunch
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'available')
    list_filter =('category', 'available')
    search_fields = ('name',)
    list_editable =('available',)

    inlines = [VariacaoInline]


# --- CONFIGURAÇÃO VISUAL DO PAINEL ---
admin.site.site_header = "Painel Administrativo - Minas Bar"
admin.site.site_title = "Minas Bar e Restaurante"
admin.site.index_title = "Gerenciamento de Cardápio"
