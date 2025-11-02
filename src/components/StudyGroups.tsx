// filepath: src/components/StudyGroups.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Share2, 
  Copy, 
  Check, 
  UserPlus, 
  Trash2,
  MessageCircle,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/lib/storage';

interface StudyGroup {
  id: string;
  name: string;
  code: string;
  members: number;
  createdAt: number;
  sharedItems: string[]; // IDs of shared history items
}

export const StudyGroups = () => {
  const { i18n } = useTranslation();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    const saved = localStorage.getItem('studyGroups');
    if (saved) {
      setGroups(JSON.parse(saved));
    }
  };

  const saveGroups = (updatedGroups: StudyGroup[]) => {
    localStorage.setItem('studyGroups', JSON.stringify(updatedGroups));
    setGroups(updatedGroups);
  };

  const generateGroupCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال اسم المجموعة' : 'Please enter group name');
      return;
    }

    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      code: generateGroupCode(),
      members: 1,
      createdAt: Date.now(),
      sharedItems: []
    };

    saveGroups([...groups, newGroup]);
    setNewGroupName('');
    setShowCreateForm(false);
    toast.success(isRTL ? 'تم إنشاء المجموعة' : 'Group created successfully');
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال كود المجموعة' : 'Please enter group code');
      return;
    }

    const group = groups.find(g => g.code === joinCode.toUpperCase());
    
    if (group) {
      // Update member count
      const updated = groups.map(g => 
        g.code === joinCode.toUpperCase() 
          ? { ...g, members: g.members + 1 }
          : g
      );
      saveGroups(updated);
      setJoinCode('');
      setShowJoinForm(false);
      toast.success(isRTL ? 'انضممت إلى المجموعة' : 'Joined group successfully');
    } else {
      toast.error(isRTL ? 'كود المجموعة غير صحيح' : 'Invalid group code');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(isRTL ? 'تم نسخ الكود' : 'Code copied');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareGroup = (group: StudyGroup) => {
    const shareText = isRTL
      ? `انضم إلى مجموعة "${group.name}" باستخدام الكود: ${group.code}`
      : `Join "${group.name}" study group with code: ${group.code}`;

    if (navigator.share) {
      navigator.share({
        title: isRTL ? 'مشاركة مجموعة الدراسة' : 'Share Study Group',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(isRTL ? 'تم نسخ رابط المشاركة' : 'Share link copied');
    }
  };

  const handleShareSolution = (groupId: string) => {
    const history = storage.getHistory();
    if (history.length === 0) {
      toast.info(isRTL ? 'لا توجد حلول لمشاركتها' : 'No solutions to share');
      return;
    }

    // Share the latest solution
    const latestItem = history[0];
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          sharedItems: [...g.sharedItems, latestItem.id]
        };
      }
      return g;
    });

    saveGroups(updated);
    toast.success(isRTL ? 'تمت مشاركة الحل' : 'Solution shared with group');
  };

  const handleDeleteGroup = (groupId: string) => {
    const updated = groups.filter(g => g.id !== groupId);
    saveGroups(updated);
    toast.success(isRTL ? 'تم حذف المجموعة' : 'Group deleted');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          {isRTL ? 'مجموعات الدراسة' : 'Study Groups'}
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {isRTL ? 'إنشاء' : 'Create'}
          </Button>
          <Button variant="outline" onClick={() => setShowJoinForm(!showJoinForm)}>
            <UserPlus className="w-4 h-4 mr-2" />
            {isRTL ? 'انضمام' : 'Join'}
          </Button>
        </div>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">
            {isRTL ? 'إنشاء مجموعة جديدة' : 'Create New Group'}
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder={isRTL ? 'اسم المجموعة' : 'Group name'}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
            />
            <Button onClick={handleCreateGroup}>
              {isRTL ? 'إنشاء' : 'Create'}
            </Button>
          </div>
        </Card>
      )}

      {/* Join Group Form */}
      {showJoinForm && (
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">
            {isRTL ? 'الانضمام إلى مجموعة' : 'Join a Group'}
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder={isRTL ? 'كود المجموعة' : 'Group code'}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinGroup()}
              maxLength={6}
            />
            <Button onClick={handleJoinGroup}>
              {isRTL ? 'انضمام' : 'Join'}
            </Button>
          </div>
        </Card>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">
            {isRTL ? 'لا توجد مجموعات' : 'No groups yet'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isRTL 
              ? 'أنشئ مجموعة دراسة أو انضم إلى واحدة موجودة'
              : 'Create a study group or join an existing one'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {group.name}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({group.members} {isRTL ? 'أعضاء' : 'members'})
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'تم الإنشاء في' : 'Created'} {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              {/* Group Code */}
              <div className="flex items-center gap-2 mb-3 p-3 bg-muted rounded-lg">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <code className="flex-1 font-mono font-bold text-lg">
                  {group.code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyCode(group.code)}
                >
                  {copiedCode === group.code ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Shared Items Count */}
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">
                  {isRTL ? 'الحلول المشتركة:' : 'Shared solutions:'}
                </span>
                <span className="font-semibold">{group.sharedItems.length}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareSolution(group.id)}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isRTL ? 'مشاركة حل' : 'Share Solution'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareGroup(group)}
                  className="flex-1"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isRTL ? 'دعوة أعضاء' : 'Invite Members'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {isRTL ? 'الدردشة' : 'Chat'}
                  <span className="ml-1 text-xs">(قريباً)</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-4 mt-6 bg-primary/5">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          {isRTL ? 'كيف تعمل مجموعات الدراسة؟' : 'How do Study Groups work?'}
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>{isRTL ? 'أنشئ مجموعة واحصل على كود فريد' : 'Create a group and get a unique code'}</li>
          <li>{isRTL ? 'شارك الكود مع أصدقائك' : 'Share the code with your friends'}</li>
          <li>{isRTL ? 'شارك الحلول والملاحظات مع المجموعة' : 'Share solutions and notes with the group'}</li>
          <li>{isRTL ? 'تعاون وتعلم معاً' : 'Collaborate and learn together'}</li>
        </ul>
      </Card>
    </div>
  );
};
