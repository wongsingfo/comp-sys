---
layout: default
title: Pandas in 30 Minutes
parent: Script
nav_order: 50
---

# Pandas in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

- Python for Data Analysis, [zh](https://github.com/apachecn/pyda-2e-zh)
- [Documentation](https://pandas.pydata.org/pandas-docs/stable/reference/index.html)
- [10 Min Documentation](https://pandas.pydata.org/docs/getting_started/10min.html)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Index / MultiIndex

```python
## construct

index = pd.Index(np.arange(3)) # Int64Index([0, 1, 2], dtype='int64')
index = pd.MultiIndex.from_tuples([('one', 'a'), ('one', 'b'),
                                   ('two', 'a'), ('two', 'b')])

## member

index.name
index.is_unique()

## manipulation

```

## Series

```python
## construct

series = pd.Series([4, 7, -5, 3])
series = pd.Series([4, 7, -5, 3], index=['d', 'b', 'a', 'c'])

## member

series.values
series.index    # RangeIndex(start=0, stop=4, step=1)

## manipulation

series.sort_index()
series.sort_values()
series.value_counts(nomalize=True) # relative frequencies
series.value_counts(ascending=True)

### set & get

series[['c', 'a', 'd']]
series[series > 0]
series1.combine_first(series2)  # update #1 with #2

## mapping

np.exp(series)
series.map(lambda x: x * 2) 

## merge

series1.append(series2)
```

## DataFrame

```python
## construct
data = {'state': ['Ohio', 'Ohio', 'Ohio', 'Nevada', 'Nevada', 'Nevada'],
        'year': [2000, 2001, 2002, 2001, 2002, 2003],
        'pop': [1.5, 1.7, 3.6, 2.4, 2.9, 3.2]}
frame = pd.DataFrame(data, 
                     columns=['year', 'state', 'pop'], 
                     index=["one", "two", "three", "four", "five", "six"])

## member

frame.index         # return Index
frame.columns       # return Index for columns

## inspection

frame.head()
frame.tail(2)    # the last 2 rows
frame.describe()

## manipulation

frame.reindex(['a', 'b', 'c', 'd', 'e'])
frame.reset_index(drop=False)
frame.T             # pivot
frame.values        # to_numpy()
frame.to_numpy()
frame.sort_index()
frame.sort_index(axis=1, ascending=False)
frame.sort_values(by=['a', 'b'])
frame.rank()
frame.rank(ascending=False, method='max')
frame.rank(axis='columns')
frame.unstack(level=-1) # Returns a DataFrame having a new level of column labels whose inner-most level consists of the pivoted index labels.

### set & get

frame['debt'] = pd.Series([-1.2, -1.5, -1.7], index=['two', 'four', 'five'])
frame[lambda df: df["debt"].isnull()] = 5

frame.loc['three']  # Row in Series
frame.iloc[2]       # Row in Series
frame.at['three', 'pop']       # can be substituted by loc()
frame.loc['three', ['state', 'pop']] # Row x Column
frame.iloc[2, [3, 0, 1]]             # Row x Column
frame.iloc[[1, 2], [3, 0, 1]]        # Row x Column 

frame[frame['three'] > 5]
frame[lambda df: df['three'] > 5]
frame[frame < 5] = 0
frame['two'] = 0
frame.iloc[:, :3][data.three > 5]

### delete

del frame['eastern']    # delete column (impure)
frame.drop(['two', 'four'], axis='columns')  # delete columns
frame.drop('a')           # delete row
frame.drop(['d', 'c'])    # delete rows

## mapping

# same result but different approches with apply()
frame.applymap(lambda x: x * 2) 

## aggragetion on axi

frame.apply(lambda x: x.max() - x.min(), axis='columns')
frame.sum()
frame.mean(axis='columns', skipna=False)
def f(x):
  return pd.Series([x.min(), x.max()], index=['min', 'max'])
frame.apply(f)
frame["debt"].apply(lambda x: x * 2) # x is a cloumn
```

## Groupby

groupby = group + mapping + concatenation

`grouped = df.groupby(?)`:

- an array indicating how to group. Its element can be
  - an array whose size is equal to the size of the index
  - a Series that maps the index to new elements.
  - a function that will be applied to the index.
  - a string `s`. sugar for `self[s]`
- `axis` 0 or 1 (rows or columns)

operation `grouped.?`:

- mean, sum, prod, median, std, var
- count (not NaN), size
- first (not NaN), last

```python
## iterablility

for name, group in df.groupby('key1'):
for (k1, k2), group in df.groupby(['key1', 'key2']):
dict(list(df.groupby('key1')))

## operation

### agg

peak_to_peak = lambda a: a.max() - a.min()
grouped.agg(['mean', 'std', peak_to_peak])
grouped['tip_pct', 'total_bill'].agg(['count', 'mean', 'max'])

### apply

def top(df, n=5, column='tip_pct'):
     return df.sort_values(by=column)[-n:]
    
f = lambda x: x.describe()
grouped.apply(f)
```

