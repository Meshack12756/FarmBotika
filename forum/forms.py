from django import forms
from .models import Comment

class CommentForm(forms.ModelForm):
    
    author_name = forms.CharField(
        max_length=100, 
        required=False, 
        widget=forms.TextInput(attrs=
            {'placeholder': 'Your name (optional)', 
             'class': 'form-control'
             })
    )
    
    class Meta:
        model = Comment
        fields = [
            'author_name',
            'content', 
            'image', 
            'video', 
            'audio', 
            'latitude', 
            'longitude', 
            #'content_type',
            #'object_id',
            #'parent_id'
        ]
        widgets = {
            'content': forms.Textarea(attrs={
                'placeholder': 'Share your farming insights...',
                'class': 'form-control',
                'rows': 3
            }),
        }
    content_type = forms.CharField(widget=forms.HiddenInput())
    object_id = forms.IntegerField(widget=forms.HiddenInput())
    parent_id = forms.IntegerField(widget=forms.HiddenInput(), required=False)
        