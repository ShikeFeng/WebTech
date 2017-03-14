/**
 * Created by root on 14/03/17.
 */
var posts = [];

window.onload = generatePosts();

function generatePosts() {
    var post1 = {}

    post1['title'] = 'HOW TO KEEP CALM AND LOVE PROGRAMMING?';
    posts.push(post1);
    console.log(posts);
}