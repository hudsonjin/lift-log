def calculate_one_rep_max(weight, reps):
    if reps == 1:
        return weight
    else:
        return weight * (1 + reps / 30)


def get_weight():
    while True:
        try:
            return float(input("Enter the weight you lifted: "))
        except ValueError:
            print("That's not a valid number. Please try again.")


def get_reps():
    while True:
        try:
            reps = int(input("Enter how many reps you did: "))
        except ValueError:
            print("That's not a valid number. Please try again.")
            continue

        if reps <= 0:
            print("Reps must be at least 1. Please try again.")
            continue

        return reps


weight = get_weight()
reps = get_reps()

if reps > 12:
    print("Warning: the Epley formula becomes less reliable at high rep counts.")

one_rep_max = calculate_one_rep_max(weight, reps)

print("Estimated one-rep max:", round(one_rep_max, 1))
