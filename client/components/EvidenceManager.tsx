import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Evidence, UserRole } from '@shared/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Shield,
  Calendar,
  User,
  Tag,
  FileIcon,
  AlertTriangle
} from 'lucide-react';

interface EvidenceManagerProps {
  caseId?: string;
  incidentId?: string;
  title?: string;
  readonly?: boolean;
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({ 
  caseId, 
  incidentId, 
  title = "Evidence Management",
  readonly = false 
}) => {
  const { user, hasAnyRole } = useAuth();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    description: '',
    tags: '',
    isSecure: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canUploadEvidence = hasAnyRole([UserRole.PREVENTIVE_OFFICER, UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]);
  const canDeleteEvidence = hasAnyRole([UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]);

  useEffect(() => {
    fetchEvidence();
  }, [caseId, incidentId]);

  const fetchEvidence = async () => {
    // Mock data - In production, fetch from API based on caseId or incidentId
    const mockEvidence: Evidence[] = [
      {
        id: 'EV-001',
        fileName: 'crime_scene_photo_1.jpg',
        fileType: 'image/jpeg',
        fileSize: 2456789,
        uploadedBy: '3',
        uploadedByName: 'Detective Sara Alemayehu',
        description: 'Initial crime scene photograph showing point of entry',
        tags: ['crime-scene', 'entry-point', 'photo'],
        caseId: caseId,
        uploadedAt: new Date('2024-01-16T10:30:00'),
        isSecure: true
      },
      {
        id: 'EV-002',
        fileName: 'witness_statement.pdf',
        fileType: 'application/pdf',
        fileSize: 567890,
        uploadedBy: '4',
        uploadedByName: 'Officer Mulugeta Kebede',
        description: 'Written statement from primary witness',
        tags: ['witness', 'statement', 'document'],
        caseId: caseId,
        uploadedAt: new Date('2024-01-16T14:15:00'),
        isSecure: false
      },
      {
        id: 'EV-003',
        fileName: 'security_footage.mp4',
        fileType: 'video/mp4',
        fileSize: 15678901,
        uploadedBy: '3',
        uploadedByName: 'Detective Sara Alemayehu',
        description: 'Security camera footage from nearby building',
        tags: ['video', 'security-footage', 'surveillance'],
        caseId: caseId,
        uploadedAt: new Date('2024-01-16T16:45:00'),
        isSecure: true
      }
    ];

    setEvidence(mockEvidence);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadEvidence = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      const newEvidenceItem: Evidence = {
        id: `EV-${String(evidence.length + 1).padStart(3, '0')}`,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        uploadedBy: user.id,
        uploadedByName: user.fullName,
        description: newEvidence.description,
        tags: newEvidence.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        caseId: caseId,
        incidentId: incidentId,
        uploadedAt: new Date(),
        isSecure: newEvidence.isSecure
      };

      setEvidence(prev => [newEvidenceItem, ...prev]);
      setIsUploading(false);
      setUploadProgress(0);
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setNewEvidence({ description: '', tags: '', isSecure: false });
    }, 2000);
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (window.confirm('Are you sure you want to delete this evidence? This action cannot be undone.')) {
      setEvidence(prev => prev.filter(e => e.id !== evidenceId));
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <FileIcon className="w-5 h-5 mr-2" />
              {title}
            </CardTitle>
            <CardDescription>
              {evidence.length} evidence item(s) uploaded
            </CardDescription>
          </div>
          {canUploadEvidence && !readonly && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Evidence
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Evidence</DialogTitle>
                  <DialogDescription>
                    Upload files related to this {caseId ? 'case' : 'incident'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    />
                    {selectedFile && (
                      <div className="text-sm text-gray-600">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvidence.description}
                      onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the evidence and its relevance..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newEvidence.tags}
                      onChange={(e) => setNewEvidence(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="e.g., photo, weapon, fingerprint, witness"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="secure"
                      checked={newEvidence.isSecure}
                      onChange={(e) => setNewEvidence(prev => ({ ...prev, isSecure: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="secure" className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Mark as secure/sensitive evidence
                    </Label>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleUploadEvidence} 
                      disabled={!selectedFile || isUploading}
                      className="bg-crime-red hover:bg-crime-red-dark text-white"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Evidence'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {evidence.map((item) => {
            const FileIconComponent = getFileIcon(item.fileType);
            
            return (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileIconComponent className="w-6 h-6 text-crime-red" />
                      <h4 className="font-semibold text-crime-black">{item.fileName}</h4>
                      {item.isSecure && (
                        <Badge className="bg-red-100 text-red-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Secure
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {formatFileSize(item.fileSize)}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags && item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {item.uploadedByName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(item.uploadedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    {canDeleteEvidence && !readonly && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteEvidence(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {evidence.length === 0 && (
            <div className="text-center py-12">
              <FileIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No evidence uploaded</h3>
              <p className="text-gray-500">
                {canUploadEvidence && !readonly 
                  ? 'Upload files to document evidence for this case'
                  : 'No evidence has been uploaded for this case yet'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
