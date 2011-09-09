Travis.Controllers.Events = SC.Object.extend({
  receive: function(event, data) {
    var events = this;
    var action = $.camelize(event.replace(':', '_'), false);
    if(data.build && data.build.status) {
      data.build.result = data.build.status;
    }
    SC.run(function() { events[action](data); });
  },

  buildQueued: function(data) {
    var queue = data.repository.slug == 'rails/rails' ? 'rails' : 'builds';
    var data = $.extend(data.build, { repository: data.repository, queue: queue });
    Travis.Job.createOrUpdate(data);
  },

  buildRemoved: function(data) {
    var job = Travis.Job.find(data.build.id);
    if(job) job.whenReady(function(job) { job.destroy() });
  },

  buildStarted: function(data) {
    Travis.Repository.createOrUpdate(data.repository);
    Travis.Build.createOrUpdate(data.build);
  },

  buildLog: function(data) {
    var test = Travis.Build.find(data.build.id);
    if(test) test.whenReady(function(test) { test.appendLog(data.build._log); });
  },

  buildFinished: function(data) {
    Travis.Repository.createOrUpdate(data.repository);
    Travis.Build.createOrUpdate(data.build);
  },
});
