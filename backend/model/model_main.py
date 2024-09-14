import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torch.utils.data import DataLoader, Dataset
from torchvision.models import resnet50

def load_data_from_path(data_path):
    return

num_classes = 0
train_data_path = ''
test_data_path = ''

num_epochs = 0 #numbers of training


# Pre-process the dataset
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Self-defined dataset class
class FruitVegetableDataset(Dataset):
    def __init__(self, data_path, transform=None):
        # Load dataset
        self.data = load_data_from_path(data_path)
        self.transform = transform
 
    def __len__(self):
        return len(self.data)
 
    def __getitem__(self, index):
        image = self.data[index]['image']
        label = self.data[index]['label']
        
        if self.transform:
            image = self.transform(image)
        
        return image, label

# Build model
model = resnet50(pretrained=True)
model.fc = nn.Linear(2048, num_classes)  # Set output layer by dataset
 
# Set device for GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
 
# Migrate model to device
model = model.to(device)
 
# Define loss function
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
 
# Load dataset
train_dataset = FruitVegetableDataset(train_data_path, transform=transform)
test_dataset = FruitVegetableDataset(test_data_path, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
 
# Model Training
for epoch in range(num_epochs):
    model.train()
    for images, labels in train_loader:
        images = images.to(device)
        labels = labels.to(device)
        
        # Forwardpropaganda
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        # Backpropaganda and optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    
    # Test model in training set
    model.eval()
    with torch.no_grad():
        correct = 0
        total = 0
        for images, labels in test_loader:
            images = images.to(device)
            labels = labels.to(device)
            
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    
    accuracy = 100 * correct / total
    print(f"Epoch [{epoch+1}/{num_epochs}], Accuracy: {accuracy:.2f}%")
 
# Save model
torch.save(model.state_dict(), 'model.pth')