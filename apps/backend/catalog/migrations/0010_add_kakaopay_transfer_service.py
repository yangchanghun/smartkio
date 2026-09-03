from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("catalog", "0009_add_kakaopay_practice_service")]

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
                    ("KTX_BOOKING", "KTX 예매"),
                    ("KAKAOPAY_LOGIN", "카카오페이 로그인"),
                    ("KAKAOPAY_ACCOUNT", "카카오페이 계좌 연결"),
                    ("KAKAOPAY_TRANSFER", "카카오페이 송금"),
                ],
                max_length=24,
            ),
        ),
    ]
