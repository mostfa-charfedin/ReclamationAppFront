import { Pipe, PipeTransform } from '@angular/core';
import { UserManagement } from '../Models/user-management';


@Pipe({
  name: 'countActive'
})
export class CountActivePipe implements PipeTransform {
  transform(users: UserManagement[]): number {
    return users ? users.filter(u => u.active).length : 0;
  }
}
