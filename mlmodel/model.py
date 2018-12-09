import  pickle
import numpy as np
import scipy.sparse as sp
import csv

def Model():
    reviews = []
    ratings = []
    offers = []
    tags = []
    with open('/tmp/testData.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                print(row)
                line_count += 1
            else:
                print(row)
                reviews.append(np.float64(row[2]))
                ratings.append(np.float64(row[1]))
                offers.append(np.float64(row[0]))
                tags.append(row[3])
                line_count += 1

    test_reviews = np.array(reviews)
    test_ratings = np.array(ratings)
    test_has_offer = np.array(offers)
    testing_data_features_list = [np.array([test_reviews]).T, np.array([test_ratings]).T, np.array([test_has_offer]).T]

    test_tags = np.array(tags)
    loaded_vectorizer = pickle.load(open('final_vectorizer.sav', 'rb'))
    testx = loaded_vectorizer.transform(test_tags)
    testing_data_features_list.append(testx)

    final_test_data = sp.hstack(testing_data_features_list)


    loaded_model = pickle.load(open('final_model.sav', 'rb'))
    result = loaded_model.predict_proba(final_test_data)
    
    res = []
    for scores in result:
        res.append(result[0][1])

    print(res)
    return res