/**
 * Created by Ivan Babaja on 12.2.2016..
 */


//This is Parent - root component
var App = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  render: function() {
    return (
      <div>
        <PostForm {...this.state} changeTitle={this.handleChangeTitle} changeText={this.handleCangeText} onPostSubmit={this.handlePostSubmit} />
        <PostList del={this.delete}  editThisPost={this.handleEditThisPost} data={this.state.data} />
      </div>
    );
  },
  componentDidMount: function() {
    this.loadPostsFromServer();
    // setInterval(this.loadPostsFromServer, this.props.pollInterval);
  },
  loadPostsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handlePostSubmit: function(post) {
    var posts = this.state.data;
    post.id = Date.now();
    var newPosts = posts.concat([post]);
    this.setState({data: newPosts});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: post,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: posts});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  delete: function(post){
    var postID = post.id;
    //console.log("ID of post which I want to delete: " +postID);
    var index = this.state.data.indexOf(post);
    var newData = React.addons.update(this.state.data, { $splice: [[index, 1]] });
    this.setState({ data: newData });
    $.ajax({
      url: this.props.url+ "/?postID="+postID,
      dataType: 'json',
      type: 'DELETE',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: newData});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleEditThisPost: function(post) {
    this.setState({title: post.title, text: post.text});
  },
  handleChangeTitle: function(title) {
    this.setState({title: title});
  },
  handleCangeText: function (text) {
    this.setState({text: text});
  }
});
var handleClick = function(post) {
  console.log('You clicked: ' + post);
}

var PostList = React.createClass({
  render: function() {
    var postNodes = this.props.data.map(function(post) {
      return (
          <Post onClick={handleClick.bind(this, post)} deletePost={this.handleDeletePost}  post={post} text={post.text} key={post.id} title={post.title} >
            {post.text}
          </Post>
      );
    }.bind(this));
    return (
      <div className="row postList">
        <h1>All Posts</h1>
        {postNodes}
      </div>
    );
  },
  handleDeletePost: function(post){
    return this.props.del(post);
  }
});

var PostForm = React.createClass({
  getInitialState: function() {
    return {title: '', text: ''};
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.state.title.trim();
    var text = this.state.text.trim();
    if (!text || !title) {
      return;
    }
    this.props.onPostSubmit({title: title, text: text});
    this.setState({title: '', text: ''});
  },
  render: function() {
    return (
      <div className="row">
        <div className="col-lg-6 col-md-6 col-sm-6">
          <h1>Add new post:</h1>
          <form className="postForm" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Blog title:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Blog Title"
                value={this.state.title}
                onChange={this.handleTitleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="color">Title color:</label>

            </div>
            <div className="form-group">
              <label htmlFor="message">Blog text:</label>
              <textarea
                rows="5"
                cols="80"
                type="text"
                className="form-control"
                placeholder="Say something..."
                value={this.state.text}
                onChange={this.handleTextChange}
              />
            </div>
            <input type="submit" className="btn btn-primary" value="Submit Post"/>
          </form>
        </div>
      </div>
    );
  }
});

//This is component for displaying single post - the lowest child of the tree
var Post = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },
  render: function() {
    return (
      <div className="single-post col-lg-12 col-md-12 col-sm-12">
        <h2 className="postTitle">
                {this.props.title}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
        <button onClick={this.clickDelete} className="btn btn-danger">Delete</button>
      </div>
    );
  },
  clickDelete: function(e) {
    e.preventDefault();
    var post = this.props.post;
    return this.props.deletePost(post);
  }
});


ReactDOM.render(
  <App url="/api/posts" pollInterval={40000} />,
  document.getElementById('content')
);
