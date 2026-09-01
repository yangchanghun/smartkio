from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("catalog", "0006_practice_session_scaling")]

    operations = [
        migrations.AlterField(
            model_name="practicesession",
            name="service",
            field=models.CharField(
                choices=[
                    ("DELIVERY", "배달의민족"),
                    ("KAKAOTALK", "카카오톡"),
                    ("TAXI", "카카오T"),
                    ("COUPANG_SIGNUP", "쿠팡 회원가입"),
                    ("COUPANG_SHOPPING", "쿠팡 상품구매"),
                    ("GOV24_LOGIN", "정부24 로그인"),
                    ("GOV24_TRANSCRIPT", "주민등록표 초본 발급"),
                    ("GOV24_MOBILE_ID", "모바일 주민등록증"),
                ],
                max_length=24,
            ),
        ),
    ]
