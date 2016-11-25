let 
    should = require('chai').should(),
    {default: ObservableAjax} = require('../dist/cjs/observableAjax.js');

describe('type check', function(){
    describe('observableAjax.ajaxType', function(){
        it(' should exist Net and Trans', function(){
            // ObservableAjax.ajaxType;
            should.exist(ObservableAjax.ajaxType);
            should.exist(ObservableAjax.ajaxType.Net);
            should.exist(ObservableAjax.ajaxType.Trans);
        });
    });

    describe('observableAjax.eventType', function(){
        it(' should exist updateStart and updateEnd and maybeNone and updateFailed', function(){
            // ObservableAjax.ajaxType;
            should.exist(ObservableAjax.eventType);
            should.exist(ObservableAjax.eventType.updateStart);
            should.exist(ObservableAjax.eventType.updateEnd);
            should.exist(ObservableAjax.eventType.updateFailed);
        });
    });
})