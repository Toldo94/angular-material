import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PostServiceService } from '../post-service.service';

import { Post } from '../post.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage: number = 1;
  pageSizeOptions: number[] = [
    1, 2, 5, 10
  ];
  userIsAuthenticated = false;
  userId: string;

  constructor(
    private postService: PostServiceService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postService.getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.postService.deletePost(id).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onChangePage(page: PageEvent) {
    this.isLoading = true;
    this.currentPage = page.pageIndex + 1;
    this.postsPerPage = page.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

}
