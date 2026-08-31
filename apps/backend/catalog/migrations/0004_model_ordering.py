from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("catalog", "0003_practicesession")]
    operations = [
        migrations.AlterModelOptions(name="category", options={"ordering": ["sort_order", "name"]}),
        migrations.AlterModelOptions(name="order", options={"ordering": ["-created_at"]}),
        migrations.AlterModelOptions(name="product", options={"ordering": ["category", "name"]}),
    ]
