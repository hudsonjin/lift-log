import builtins
from one_rep_max import calculate_one_rep_max, get_reps


def run_with_fake_input(fake_answers, function_to_test):
    fake_answers_iterator = iter(fake_answers)
    original_input = builtins.input

    def fake_input(prompt=''):
        return next(fake_answers_iterator)

    builtins.input = fake_input
    try:
        return function_to_test()
    finally:
        builtins.input = original_input


def test_normal_calculation():
    result = calculate_one_rep_max(135, 8)
    assert result == 171.0, f"Expected 171.0, got {result}"
    print("PASS: 135 lbs x 8 reps gives a sensible estimate (171.0)")


def test_zero_reps_rejected():
    result = run_with_fake_input(["0", "8"], get_reps)
    assert result == 8, f"Expected get_reps() to reject 0 and accept 8, got {result}"
    print("PASS: 0 reps is rejected, next valid entry (8) is accepted")


def test_non_numeric_reps_rejected():
    result = run_with_fake_input(["abc", "8"], get_reps)
    assert result == 8, f"Expected get_reps() to reject 'abc' and accept 8, got {result}"
    print("PASS: non-numeric input ('abc') is rejected, next valid entry (8) is accepted")


test_normal_calculation()
test_zero_reps_rejected()
test_non_numeric_reps_rejected()

print("All tests passed!")
