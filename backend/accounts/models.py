from django.db import models

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)
    highlight = models.BooleanField(default=True) #prato do dia destaque

    def __str__(self):
        return self.name

class PackedLunch(models.Model):
    product = models.ForeignKey(Product, related_name='variation', on_delete=models.CASCADE)
    size = models.CharField(max_length=10, choices=[('P', 'Pequena'), ('M', 'Média'), ('G', 'Grande')])
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} = {self.size}"
    