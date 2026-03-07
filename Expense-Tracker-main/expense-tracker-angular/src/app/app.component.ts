import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from './services/expense.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isLoggedIn = false;

  expenseTitle = '';
  amount = 0;
  category = '';
  date = '';
  searchQuery = '';
  filterCategory = '';
  editingIndex: number | null = null;

  expenses: any[] = [];
  
  categories = [
    { name: 'Food', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
    { name: 'Entertainment', icon: '🎬', color: '#45B7D1' },
    { name: 'Shopping', icon: '🛍️', color: '#FFA07A' },
    { name: 'Bills', icon: '📄', color: '#98D8C8' },
    { name: 'Health', icon: '🏥', color: '#F7DC6F' },
    { name: 'Other', icon: '📎', color: '#BB8FCE' }
  ];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(){
    this.checkLoginStatus();
    if (this.isLoggedIn) {
      this.getExpenses();
    }
  }

  checkLoginStatus() {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    if(token && userEmail){
      this.isLoggedIn = true;
    }
  }

  logout() {
    // Don't remove expenses data - keep it for when user logs back in
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    this.isLoggedIn = false;
    this.expenses = []; // Clear from memory
    window.location.href = '/login';
  }

  getExpenses() {
    this.expenseService.getExpenses().subscribe({
      next: (data: any) => {
        this.expenses = data;
        console.log(`Loaded ${this.expenses.length} expenses from server`);
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.expenses = [];
        alert('Failed to load expenses from server');
      }
    });
  }

  addExpense(){
    if (!this.expenseTitle || !this.amount || !this.category || !this.date) {
      alert("Please fill in all fields");
      return;
    }

    const expenseData = {
      title: this.expenseTitle,
      amount: this.amount,
      category: this.category,
      date: this.date
    };

    if (this.editingIndex !== null) {
      // Update existing expense
      const expense = this.expenses[this.editingIndex];
      if (expense._id) {
        // Update via API
        this.expenseService.updateExpense(expense._id, expenseData).subscribe({
          next: (updatedExpense: any) => {
            this.expenses[this.editingIndex!] = updatedExpense;
            this.editingIndex = null;
            this.resetForm();
            console.log('Expense updated successfully');
          },
          error: (error) => {
            console.error('Error updating expense:', error);
            alert('Failed to update expense');
          }
        });
      } else {
        // Fallback for expenses without ID
        this.expenses[this.editingIndex] = expenseData;
        this.editingIndex = null;
        this.resetForm();
      }
    } else {
      // Add new expense via API
      this.expenseService.addExpense(expenseData).subscribe({
        next: (newExpense: any) => {
          this.expenses.push(newExpense);
          this.resetForm();
          console.log('Expense added successfully');
        },
        error: (error) => {
          console.error('Error adding expense:', error);
          alert('Failed to add expense');
        }
      });
    }
  }

  resetForm() {
    this.expenseTitle = '';
    this.amount = 0;
    this.category = '';
    this.date = '';
  }

  editExpense(index: number) {
    const expense = this.expenses[index];
    this.expenseTitle = expense.title;
    this.amount = expense.amount;
    this.category = expense.category;
    this.date = expense.date;
    this.editingIndex = index;
  }

  getTotalExpenses(){
    return this.getFilteredExpenses().reduce((total, expense) => total + expense.amount, 0);
  }

  getAverageExpense() {
    const filtered = this.getFilteredExpenses();
    return filtered.length > 0 ? (this.getTotalExpenses() / filtered.length).toFixed(2) : 0;
  }

  getMaxExpense() {
    const filtered = this.getFilteredExpenses();
    return filtered.length > 0 ? Math.max(...filtered.map(e => e.amount)) : 0;
  }

  getFilteredExpenses() {
    let filtered = this.expenses;

    if (this.filterCategory) {
      filtered = filtered.filter(e => e.category === this.filterCategory);
    }

    if (this.searchQuery.trim()) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    return filtered;
  }

  getCategoryColor(categoryName: string) {
    const cat = this.categories.find(c => c.name === categoryName);
    return cat ? cat.color : '#999';
  }

  getCategoryIcon(categoryName: string) {
    const cat = this.categories.find(c => c.name === categoryName);
    return cat ? cat.icon : '📎';
  }

  getExpensesByCategory() {
    const grouped: { [key: string]: number } = {};
    this.getFilteredExpenses().forEach(expense => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = 0;
      }
      grouped[expense.category] += expense.amount;
    });
    return Object.entries(grouped).map(([category, amount]) => ({ category, amount: amount as number }));
  }

  getCategoryPercentage(amount: any) {
    const total = this.getTotalExpenses();
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    return total > 0 ? (numAmount / total) * 100 : 0;
  }

  cancelEdit() {
    this.resetForm();
    this.editingIndex = null;
  }

  deleteExpense(index: number){
    const expense = this.expenses[index];
    if (expense._id) {
      // Delete via API
      this.expenseService.deleteExpense(expense._id).subscribe({
        next: () => {
          this.expenses.splice(index, 1);
          console.log('Expense deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
          alert('Failed to delete expense');
        }
      });
    } else {
      // Fallback for expenses without ID
      this.expenses.splice(index, 1);
    }
    this.editingIndex = null;
  }

  clearAllExpenses() {
    if (confirm('Are you sure you want to delete all expenses? This will permanently delete them from the server and cannot be undone.')) {
      // Delete all expenses from server
      const deletePromises = this.expenses
        .filter(expense => expense._id)
        .map(expense => this.expenseService.deleteExpense(expense._id).toPromise());

      Promise.all(deletePromises).then(() => {
        this.expenses = [];
        this.resetForm();
        console.log('All expenses deleted successfully');
      }).catch(error => {
        console.error('Error deleting expenses:', error);
        alert('Failed to delete some expenses');
        // Reload expenses to show current state
        this.getExpenses();
      });
    }
  }

  exportExpenses() {
    const dataStr = JSON.stringify(this.expenses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `expenses_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  importExpenses(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedExpenses = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedExpenses)) {
            // Add each imported expense to the server
            const addPromises = importedExpenses.map(expense => 
              this.expenseService.addExpense(expense).toPromise()
            );

            Promise.all(addPromises).then((addedExpenses) => {
              this.expenses = [...this.expenses, ...addedExpenses];
              alert(`Successfully imported ${importedExpenses.length} expenses! Total: ${this.expenses.length}`);
            }).catch(error => {
              console.error('Error importing expenses:', error);
              alert('Failed to import some expenses');
            });
          } else {
            alert('Invalid file format. Please select a valid JSON file.');
          }
        } catch (error) {
          alert('Error reading file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    event.target.value = '';
  }

}