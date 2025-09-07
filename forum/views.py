from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.contenttypes.models import ContentType
from .forms import CommentForm
from .models import Comment, Thread
from django.contrib import messages

# Create your views here.
def thread_list(request):
    threads = Thread.objects.all().order_by('-created_at')
    return render(request, 'forum/thread_list.html', {'threads': threads})

def thread_detail(request, thread_id):
    thread = get_object_or_404(Thread, pk=thread_id)
    # Top-level comments only
    ct = ContentType.objects.get_for_model(Thread)
    comments = Comment.objects.filter(
        content_type=ct,
        object_id=thread_id,
        parent__isnull=True
    ).order_by('created_at')

    form = CommentForm() # Fresh form for new comment

    return render(request, 'forum/thread_detail.html', {
        'thread': thread,
        'comments': comments,
        'form': form,
        'level': 0,
    })

def post_comment(request):
    # Handle non-POST requests
    if request.method != 'POST':
        return redirect('thread_list')
    
    form = CommentForm(request.POST, request.FILES)
    
    if form.is_valid():
        try:
            ctype = form.cleaned_data['content_type']
            obj_id = form.cleaned_data['object_id']
            content_type = ContentType.objects.get(model=ctype)
            
            parent_obj = None
            parent_id = form.cleaned_data.get('parent_id')
            if parent_id:
                parent_obj = Comment.objects.filter(id=parent_id).first()
            
            comment = form.save(commit=False)
            comment.content_type = content_type
            comment.object_id = obj_id
            comment.parent = parent_obj

            comment.save()

            messages.success(request, 'Comment posted successfully!')

            return redirect('thread_detail', thread_id=obj_id)
        
        except Exception as e:
            messages.error(request, f'Error posting comment: {str(e)}')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(request, f"{field.capitalize()}: {error}")
    
    # Handle invalid form submission
    thread_id = request.POST.get('object_id')
    if thread_id:
        return redirect('thread_detail', thread_id=thread_id)
    return redirect('thread_list')

