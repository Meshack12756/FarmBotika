from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')
    
    def has_object_permission(self, request, view, obj):
        # Admin always has access
        return self.has_permission(request, view)


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'STAFF'])
    
    def has_object_permission(self, request, view, obj):
        # Staff (and Admin) allowed at object-level
        return self.has_permission(request, view)


class IsFarmer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'FARMER')
    
    def has_object_permission(self, request, view, obj):
        # Farmer allowed only if owner
        return bool(request.user and request.user.is_authenticated and obj == request.user)


class IsOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        # Allow request to reach object-level check
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Owner or Admin
        return bool(
            request.user.role == 'ADMIN' or obj == request.user
        )


class IsStaffOrOwner(BasePermission):
    def has_permission(self, request, view):
        # Allow request to proceed
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Staff/Admin or owner
        return bool(
            request.user.role in ['ADMIN', 'STAFF'] or obj == request.user
        )

