import torch
import torch.nn as nn

from torchvision.models import mobilenet_v3_small


class COCOMobileNetV3(nn.Module):

    def __init__(self, num_classes=5):

        super().__init__()

        self.model = mobilenet_v3_small(
            weights='DEFAULT'
        )

        # Freeze backbone initially
        self.freeze_backbone()

        in_features = self.model.classifier[3].in_features

        self.model.classifier[3] = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(in_features, num_classes)
        )

    def forward(self, x):

        return self.model(x)

    # =====================================================
    # Freeze entire backbone
    # =====================================================

    def freeze_backbone(self):

        for param in self.model.features.parameters():
            param.requires_grad = False

    # =====================================================
    # Unfreeze last block
    # =====================================================

    def unfreeze_last_block(self):

        for param in self.model.features[-1:].parameters():
            param.requires_grad = True

    # =====================================================
    # Unfreeze last 2 blocks
    # =====================================================

    def unfreeze_last_two_blocks(self):

        for param in self.model.features[-2:].parameters():
            param.requires_grad = True

    # =====================================================
    # Progressive transfer learning
    # =====================================================

    def set_training_stage(self, round_num):

        # Phase 1
        if round_num <= 5:

            self.freeze_backbone()

        # Phase 2
        elif round_num <= 10:

            self.freeze_backbone()

            self.unfreeze_last_block()

        # Phase 3
        else:

            self.freeze_backbone()

            self.unfreeze_last_two_blocks()

    # =====================================================
    # Parameter counts
    # =====================================================

    def get_total_params(self):

        return sum(
            p.numel()
            for p in self.parameters()
        )

    def get_trainable_params(self):

        return sum(
            p.numel()
            for p in self.parameters()
            if p.requires_grad
        )