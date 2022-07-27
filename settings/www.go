package settings

var WWW *www

type www struct {
	LogsRefreshInterval int
}

func init() {
	WWW = &www{}
}
