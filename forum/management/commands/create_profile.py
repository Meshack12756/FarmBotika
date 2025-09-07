from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from forum.models import UserProfile

User = get_user_model()

class Command(BaseCommand):
    help = "Create a user and associated profile"

    def add_arguments(self, parser):
        parser.add_argument("username", type=str)
        parser.add_argument("--role", default="farmer")
        parser.add_argument("--region", default="", help="Region name")

    def handle(self, *args, **options):
        u, created = User.objects.get_or_create(username=options["username"])
        profile, p_created = UserProfile.objects.get_or_create(
            user=u,
            defaults={"role": options["role"], "region": options["region"]}
        )
        self.stdout.write(self.style.SUCCESS(
            f"User {'created' if created else 'exists'}: {u.username}\n"
            f"Profile {'created' if p_created else 'exists'}: role={profile.role}, region={profile.region}"
        ))

