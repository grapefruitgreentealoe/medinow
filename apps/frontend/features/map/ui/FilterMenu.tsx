import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FilterIcon } from 'lucide-react';
import { memo } from 'react';
import { useAtom } from 'jotai';
import { categoryAtom, openStatusAtom } from '../atoms/filterAtom';

export default function FilterMenu() {
  const [category, setCategory] = useAtom(categoryAtom);
  const [openStatus, setOpenStatus] = useAtom(openStatusAtom);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="bg-primary text-white">
          <FilterIcon className="w-5 h-5 " />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] !p-4 space-y-4" align="start">
        {/* 기관 종류 */}
        <div>
          <span className="mb-1 text-xs text-muted-foreground">기관 종류</span>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full h-9 border-muted text-sm bg-white hover:bg-muted">
              <SelectValue placeholder="종류 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                className="!p-[2px] h-9 border-muted text-sm bg-white hover:bg-muted"
                value="전체"
              >
                전체
              </SelectItem>
              <SelectItem
                className="!p-[2px] h-9 border-muted text-sm bg-white hover:bg-muted"
                value="응급실"
              >
                응급실
              </SelectItem>
              <SelectItem
                className="!p-[2px] h-9 border-muted text-sm bg-white hover:bg-muted"
                value="약국"
              >
                약국
              </SelectItem>
              <SelectItem
                className="!p-[2px] h-9 border-muted text-sm bg-white hover:bg-muted"
                value="병원"
              >
                병원
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 운영 상태 */}
        <div>
          <span className="mb-1 text-xs text-muted-foreground">운영상태</span>
          <Select value={openStatus} onValueChange={setOpenStatus}>
            <SelectTrigger className="w-full h-9 border-muted text-sm bg-white hover:bg-muted">
              <SelectValue placeholder="운영상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                className="!p-[2px] h-9 border-muted text-sm bg-white hover:bg-muted"
                value="true"
              >
                운영중
              </SelectItem>
              <SelectItem
                className="!p-[2px] h-9 border-muted text-sm bg-white hover:bg-muted"
                value="false"
              >
                전체
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
