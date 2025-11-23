import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, keys: string[] = []): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      
      if (keys.length > 0) {
        return keys.some(key => {
          const val = item[key];
          return val && val.toString().toLowerCase().includes(searchText);
        });
      }
      
      // Búsqueda genérica en todos los valores del objeto
      return JSON.stringify(item).toLowerCase().includes(searchText);
    });
  }
}