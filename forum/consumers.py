#forum/consumers.py

import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

class CommentConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = "comments_room"
        async_to_sync(self.channel_layer.group_add)
        (self.room_group_name, self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)
        (self.room_group_name, self.channel_name)

    def receive(self, text_data):
        data = json.loads(text_data)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                "type": "broadcast_comment",
                "message": data['message']
            }
        )
    
    def broadcast_comment(self, event):
        message = event['message']
        self.send(text_data=json.dumps({"message": message}))