import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators'
import { Post } from './post.model';


@Injectable({
  providedIn: 'root'
})
export class PostServiceService {

  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, maxPosts: number }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
            };
          }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe(transformetPostData => {
        this.posts = transformetPostData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postCount: transformetPostData.maxPosts });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    //const post: Post = { id: "", title: title, content: content };
    this.http
      .post<{ message: string, post: Post }>("http://localhost:3000/api/posts", postData)
      .subscribe((responseData) => {
        this.router.navigate(['/'])
      });
  }

  updatePost(postId: string, title: string, content: string, image: File | string) {
    let postData
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append("id", postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title)
    } else {
      postData = {
        id: postId,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put<{ message: string, imagePath: string }>("http://localhost:3000/api/posts/" + postId, postData)
      .subscribe(response => {
        this.router.navigate(['/'])
      });
  }

  deletePost(postId: string) {
    return this.http.delete<{ message: string }>("http://localhost:3000/api/posts/" + postId);
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string
    }>("http://localhost:3000/api/posts/" + id);
  }

}
