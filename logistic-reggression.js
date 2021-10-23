function generateData(total,boundary,upper,lower) {
    for (var i=0; i<total; i++){
        var X1, X2, Y;

        var cutoff = P5.random()*(upper-lower)+lower;

        if (i<=boundary){
            X1 = P5.random(lower,cutoff*0.9);
            X2 = P5.random(lower,cutoff*0.9);
            Y = 0;
        } else if (i>boundary){
            X1 = P5.random(cutoff*1.1,upper);
            X2 = P5.random(cutoff*1.1,upper);
            Y = 1;
        }

        data.push({x1:X1, x2:X2, y:Y});

    }

    var progresspercent = 0;

        $('.progress-bar').css('width', progresspercent+'%').attr('aria-valuenow', progresspercent);
    // console.log(data);
}

function train(epochs, alpha){

    console.log(data);

    errors =[];
    A = 0.0;
    B = 0.0;
    C = 0.0;

    var count =0;
    for (var i=0; i<epochs; i++){
        var error;
        
        data.forEach(d=>{

            var predY;
            var func;
            func = A*d.x1/100+B*d.x2/100+C;
            predY = 1/(1+Math.exp(-func));
            error = predY - d.y;
            tempA = A;
            tempB = B;
            tempC = C;

            A = tempA + alpha*-error*predY*(1-predY)*d.x1/100;
            B = tempB + alpha*-error*predY*(1-predY)*d.x2/100;
            C = tempC + alpha*-error*predY*(1-predY)*1.0;
            
            // errors.push({error:error, iteration:count});
            // count++;
        })

        console.log('A', A, 'B', B, 'C', C);
        console.log('Error', error);
        errors.push({error:error, epoch:i});

        var accuracy = 1+Math.round(error*100)/100;
        $('#accuracy').text(accuracy);


        var progresspercent = 100*i/500;

        $('.progress-bar').css('width', progresspercent+'%').attr('aria-valuenow', progresspercent);
    }

    console.log(errors);
}

function predict(x1,x2){

    var predY;
    var func;
    var out;
    func = A*x1/100+B*x2/100+C;
    predY = 1/(1+Math.exp(-func));

    if(predY>0.5){out=1}
    else if (predY<0.5){out=0};

    return out;
}


